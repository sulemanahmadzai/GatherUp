import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { admin } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { invalidateUserCache } from "@/lib/cache/helpers";

// GET /api/admin - Get current admin profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [adminData] = await db
      .select({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      })
      .from(admin)
      .where(eq(admin.id, user.id));

    if (!adminData) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(adminData);
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin - Update admin profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Validation
    if (!name && !email) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another admin
    if (email) {
      const [existingAdmin] = await db
        .select()
        .from(admin)
        .where(eq(admin.email, email));

      if (existingAdmin && existingAdmin.id !== user.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const [updatedAdmin] = await db
      .update(admin)
      .set(updateData)
      .where(eq(admin.id, user.id))
      .returning({
        id: admin.id,
        name: admin.name,
        email: admin.email,
      });

    // Invalidate cache
    await invalidateUserCache(user.id);

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin profile" },
      { status: 500 }
    );
  }
}
