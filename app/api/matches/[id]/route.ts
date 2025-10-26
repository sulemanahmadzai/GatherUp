import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { matches, matchMembers, members } from "@/lib/db/schema";
import { getAdmin, getMatchById } from "@/lib/db/queries";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { invalidateUserCache } from "@/lib/cache";

// GET - Get single match details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
    }

    const matchData = await getMatchById(matchId);

    if (!matchData) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(matchData);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}

// DELETE - Dissolve match (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
    }

    // Get match to verify it exists
    const matchData = await getMatchById(matchId);
    if (!matchData) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Get all member IDs in this match
    const memberIds = matchData.members.map((m) => m.member.id);

    // Update match status to dissolved
    await db
      .update(matches)
      .set({
        status: "dissolved",
        dissolvedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    // Mark matchMembers as left
    await db
      .update(matchMembers)
      .set({
        leftAt: new Date(),
      })
      .where(
        and(eq(matchMembers.matchId, matchId), isNull(matchMembers.leftAt))
      );

    // Update member statuses back to unmatched
    if (memberIds.length > 0) {
      await db
        .update(members)
        .set({
          status: "unmatched",
          updatedAt: new Date(),
        })
        .where(inArray(members.id, memberIds));

      // Invalidate cache for all affected members
      for (const memberId of memberIds) {
        await invalidateUserCache(memberId);
      }
    }

    return NextResponse.json({
      message: "Match dissolved successfully",
      matchId,
      affectedMembers: memberIds.length,
    });
  } catch (error) {
    console.error("Error dissolving match:", error);
    return NextResponse.json(
      { error: "Failed to dissolve match" },
      { status: 500 }
    );
  }
}

// PATCH - Update match notes (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
    }

    const body = await request.json();
    const { notes } = body;

    const [updatedMatch] = await db
      .update(matches)
      .set({
        notes,
      })
      .where(eq(matches.id, matchId))
      .returning();

    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
