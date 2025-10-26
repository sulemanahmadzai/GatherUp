import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { staff } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  getCached,
  invalidateTeamCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/cache";

// GET all staff for the user's team
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const teamMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq }) => eq(teamMembers.userId, user.id),
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10"), 1),
      100
    );
    const offset = (page - 1) * pageSize;

    console.log(
      `[API staff] team=${teamMember.teamId} page=${page} size=${pageSize}`
    );

    // Cache the count
    const count = await getCached(
      CACHE_KEYS.STAFF_COUNT(teamMember.teamId),
      async () => {
        const start = Date.now();
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(staff)
          .where(eq(staff.teamId, teamMember.teamId));
        const ms = Date.now() - start;
        console.log(`[DB staff_count team=${teamMember.teamId}] ${ms}ms`);
        return Number(count);
      },
      CACHE_TTL.MEDIUM
    );

    // Cache the items
    const items = await getCached(
      CACHE_KEYS.STAFF(teamMember.teamId, page, pageSize),
      async () => {
        const start = Date.now();
        return await db
          .select({
            id: staff.id,
            fullName: staff.fullName,
            gender: staff.gender,
            phoneNumber: staff.phoneNumber,
            email: staff.email,
            address: staff.address,
            role: staff.role,
            department: staff.department,
            joiningDate: staff.joiningDate,
            status: staff.status,
            shiftTime: staff.shiftTime,
            salary: staff.salary,
            paymentType: staff.paymentType,
            lastPaymentDate: staff.lastPaymentDate,
            tasksCompleted: staff.tasksCompleted,
            createdAt: staff.createdAt,
            // Exclude heavy fields: teamId, updatedAt, dateOfBirth, emergencyContactName, emergencyContactPhone, relationship
          })
          .from(staff)
          .where(eq(staff.teamId, teamMember.teamId))
          .orderBy(desc(staff.createdAt))
          .limit(pageSize)
          .offset(offset)
          .then((rows) => {
            const ms = Date.now() - start;
            console.log(`[DB staff_list team=${teamMember.teamId}] ${ms}ms`);
            return rows;
          });
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json({ items, total: count, page, pageSize });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST - Create new staff member
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const teamMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq }) => eq(teamMembers.userId, user.id),
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      address,
      role,
      department,
      joiningDate,
      status: staffStatus,
      shiftTime,
      salary,
      paymentType,
      lastPaymentDate,
      tasksCompleted,
      emergencyContactName,
      emergencyContactPhone,
      relationship,
    } = body;

    // Validate required fields
    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Full name and phone number are required" },
        { status: 400 }
      );
    }

    // Create staff member
    const [newStaff] = await db
      .insert(staff)
      .values({
        teamId: teamMember.teamId,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        email,
        address,
        role,
        department,
        joiningDate,
        status: staffStatus || "active",
        shiftTime,
        salary,
        paymentType,
        lastPaymentDate,
        tasksCompleted,
        emergencyContactName,
        emergencyContactPhone,
        relationship,
      })
      .returning();

    // Invalidate cache after creating staff
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}

// PUT - Update staff member
export async function PUT(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const teamMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq }) => eq(teamMembers.userId, user.id),
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    // Update staff member (only if it belongs to the user's team)
    const [updatedStaff] = await db
      .update(staff)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(staff.id, id), eq(staff.teamId, teamMember.teamId)))
      .returning();

    if (!updatedStaff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Invalidate cache after updating staff
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete staff member
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's team
    const teamMember = await db.query.teamMembers.findFirst({
      where: (teamMembers, { eq }) => eq(teamMembers.userId, user.id),
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    // Delete staff member (only if it belongs to the user's team)
    const [deletedStaff] = await db
      .delete(staff)
      .where(
        and(eq(staff.id, parseInt(id)), eq(staff.teamId, teamMember.teamId))
      )
      .returning();

    if (!deletedStaff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Invalidate cache after deleting staff
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    );
  }
}
