import { NextResponse } from "next/server";
import { getMember, getMemberWithDetails } from "@/lib/db/queries";

export async function GET() {
  try {
    const member = await getMember();
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberData = await getMemberWithDetails(member.id);

    return NextResponse.json(memberData);
  } catch (error) {
    console.error("Error fetching member dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
