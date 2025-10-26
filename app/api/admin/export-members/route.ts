import { NextRequest, NextResponse } from "next/server";
import { getUser, getAllMembers } from "@/lib/db/queries";

// GET /api/admin/export-members - Export all members as CSV
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all members (including pending)
    const membersData = await getAllMembers({ includePending: true });

    // Create CSV header
    const headers = [
      "ID",
      "Name",
      "Email",
      "Status",
      "Goal Category",
      "Goal Text",
      "Progress",
      "Preferred Communication",
      "Preferred Match Type",
      "Commitment Level",
      "Created At",
      "Matched At",
      "Last Active",
    ];

    // Create CSV rows
    const rows = membersData.map((item: any) => {
      const member = item.member;
      const goal = item.goal;

      return [
        member.id,
        `"${member.name || ""}"`,
        member.email,
        member.status,
        goal?.category || "",
        `"${goal?.goalText?.replace(/"/g, '""') || ""}"`,
        goal?.currentProgress || "",
        member.preferredCommunication || "",
        member.preferredMatchType || "",
        member.commitmentLevel || "",
        member.createdAt
          ? new Date(member.createdAt).toISOString().split("T")[0]
          : "",
        member.matchedAt
          ? new Date(member.matchedAt).toISOString().split("T")[0]
          : "",
        member.lastActiveAt
          ? new Date(member.lastActiveAt).toISOString().split("T")[0]
          : "",
      ].join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="gatherup-members-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting members:", error);
    return NextResponse.json(
      { error: "Failed to export members" },
      { status: 500 }
    );
  }
}
