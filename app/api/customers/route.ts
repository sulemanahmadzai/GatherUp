import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { customers } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  getCached,
  invalidateTeamCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/cache";

// GET all customers for the user's team
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
    const idParam = searchParams.get("id");

    // If id is provided, return single customer (with caching)
    if (idParam) {
      const id = parseInt(idParam);
      if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      console.log(`[API customers:id] team=${teamMember.teamId} id=${id}`);
      const item = await getCached(
        CACHE_KEYS.CUSTOMER_BY_ID(id),
        async () => {
          const start = Date.now();
          const rows = await db
            .select()
            .from(customers)
            .where(
              and(eq(customers.id, id), eq(customers.teamId, teamMember.teamId))
            )
            .limit(1);
          const ms = Date.now() - start;
          console.log(`[DB customer_by_id team=${teamMember.teamId}] ${ms}ms`);
          return rows[0] || null;
        },
        CACHE_TTL.MEDIUM
      );

      if (!item)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(item);
    }
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10"), 1),
      100
    );
    const offset = (page - 1) * pageSize;

    console.log(
      `[API customers] team=${teamMember.teamId} page=${page} size=${pageSize}`
    );

    // Cache the count
    const count = await getCached(
      CACHE_KEYS.CUSTOMERS_COUNT(teamMember.teamId),
      async () => {
        const start = Date.now();
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(customers)
          .where(eq(customers.teamId, teamMember.teamId));
        const ms = Date.now() - start;
        console.log(`[DB customers_count team=${teamMember.teamId}] ${ms}ms`);
        return Number(count);
      },
      CACHE_TTL.MEDIUM
    );

    // Cache the items
    const items = await getCached(
      CACHE_KEYS.CUSTOMERS(teamMember.teamId, page, pageSize),
      async () => {
        const start = Date.now();
        return await db
          .select({
            id: customers.id,
            name: customers.name,
            mobileNumber: customers.mobileNumber,
            email: customers.email,
            address: customers.address,
            registrationNumber: customers.registrationNumber,
            make: customers.make,
            model: customers.model,
            colour: customers.colour,
            fuelType: customers.fuelType,
            motExpiry: customers.motExpiry,
            taxDueDate: customers.taxDueDate,
            createdAt: customers.createdAt,
            // Exclude heavy fields: teamId, updatedAt
          })
          .from(customers)
          .where(eq(customers.teamId, teamMember.teamId))
          .orderBy(desc(customers.createdAt))
          .limit(pageSize)
          .offset(offset)
          .then((rows) => {
            const ms = Date.now() - start;
            console.log(
              `[DB customers_list team=${teamMember.teamId}] ${ms}ms`
            );
            return rows;
          });
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json({ items, total: count, page, pageSize });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST - Create new customer
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
      name,
      mobileNumber,
      email,
      address,
      registrationNumber,
      make,
      model,
      colour,
      fuelType,
      motExpiry,
      taxDueDate,
    } = body;

    // Validate required fields
    if (!name || !mobileNumber || !registrationNumber) {
      return NextResponse.json(
        { error: "Name, mobile number, and registration number are required" },
        { status: 400 }
      );
    }

    // Create customer
    const [newCustomer] = await db
      .insert(customers)
      .values({
        teamId: teamMember.teamId,
        name,
        mobileNumber,
        email,
        address,
        registrationNumber: registrationNumber.toUpperCase(),
        make,
        model,
        colour,
        fuelType,
        motExpiry,
        taxDueDate,
      })
      .returning();

    // Invalidate cache after creating customer
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

// PUT - Update customer
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
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Ensure registration number is uppercase if provided
    if (updateData.registrationNumber) {
      updateData.registrationNumber =
        updateData.registrationNumber.toUpperCase();
    }

    // Update customer (only if it belongs to the user's team)
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(customers.id, id), eq(customers.teamId, teamMember.teamId)))
      .returning();

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Invalidate cache after updating customer
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
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
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Delete customer (only if it belongs to the user's team)
    const [deletedCustomer] = await db
      .delete(customers)
      .where(
        and(
          eq(customers.id, parseInt(id)),
          eq(customers.teamId, teamMember.teamId)
        )
      )
      .returning();

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Invalidate cache after deleting customer
    await invalidateTeamCache(teamMember.teamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
