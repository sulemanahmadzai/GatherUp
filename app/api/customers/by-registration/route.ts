import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { customers } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq, and } from "drizzle-orm";

// GET customer by vehicle registration number
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
    const registrationNumber = searchParams.get("registrationNumber");

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Registration number is required" },
        { status: 400 }
      );
    }

    // Find customer by registration number (case-insensitive) for this team
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.teamId, teamMember.teamId),
        eq(customers.registrationNumber, registrationNumber.toUpperCase())
      ),
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found", found: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer, found: true });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}
