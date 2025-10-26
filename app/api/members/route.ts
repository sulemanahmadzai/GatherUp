import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, goals } from "@/lib/db/schema";
import { getAdmin, getAllMembers } from "@/lib/db/queries";
import { desc, eq, and, sql } from "drizzle-orm";

// GET - List all members with filters (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const matchType = searchParams.get("matchType") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const membersData = await getAllMembers({
      status,
      matchType,
      category,
      search,
    });

    return NextResponse.json(membersData);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST - Create new member (admin only, manual add)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, passwordHash } = body;

    if (!email || !name || !passwordHash) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Check if member already exists
    const existing = await db
      .select()
      .from(members)
      .where(eq(members.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A member with this email already exists" },
        { status: 400 }
      );
    }

    const [newMember] = await db
      .insert(members)
      .values({
        email,
        name,
        passwordHash,
        status: "pending",
      })
      .returning();

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
