import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  members,
  goals,
  progressUpdates,
  matches,
  matchMembers,
} from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

// GET /api/member/export-data - Export member's personal data
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "member") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get member data
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, user.id));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get member's goals
    const memberGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.memberId, user.id));

    // Get progress updates
    const memberProgress = await db
      .select()
      .from(progressUpdates)
      .where(eq(progressUpdates.memberId, user.id));

    // Get matches
    const memberMatches = await db
      .select({
        match: matches,
        joinedAt: matchMembers.joinedAt,
        leftAt: matchMembers.leftAt,
      })
      .from(matchMembers)
      .innerJoin(matches, eq(matchMembers.matchId, matches.id))
      .where(eq(matchMembers.memberId, user.id));

    // Create JSON export
    const exportData = {
      exportDate: new Date().toISOString(),
      profile: {
        name: member.name,
        email: member.email,
        status: member.status,
        preferredCommunication: member.preferredCommunication,
        preferredMatchType: member.preferredMatchType,
        accountabilityStyle: member.accountabilityStyle,
        commitmentLevel: member.commitmentLevel,
        createdAt: member.createdAt,
        matchedAt: member.matchedAt,
        lastActiveAt: member.lastActiveAt,
      },
      goals: memberGoals.map((g) => ({
        goalText: g.goalText,
        category: g.category,
        targetDate: g.targetDate,
        measurableOutcome: g.measurableOutcome,
        currentProgress: g.currentProgress,
        status: g.status,
        createdAt: g.createdAt,
      })),
      progressHistory: memberProgress.map((p) => ({
        progressScore: p.progressScore,
        notes: p.notes,
        createdAt: p.createdAt,
      })),
      matches: memberMatches.map((m) => ({
        matchType: m.match.matchType,
        status: m.match.status,
        joinedAt: m.joinedAt,
        leftAt: m.leftAt,
        createdAt: m.match.createdAt,
      })),
    };

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="gatherup-my-data-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting member data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
