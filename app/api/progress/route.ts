import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { progressUpdates, goals } from "@/lib/db/schema";
import { getMember } from "@/lib/db/queries";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const member = await getMember();
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { progressScore, notes } = body;

    if (!progressScore || progressScore < 1 || progressScore > 12) {
      return NextResponse.json(
        { error: "Progress score must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Get member's active goal
    const [activeGoal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.memberId, member.id), eq(goals.status, "active")))
      .limit(1);

    if (!activeGoal) {
      return NextResponse.json(
        { error: "No active goal found" },
        { status: 404 }
      );
    }

    // Create progress update
    const [progressUpdate] = await db
      .insert(progressUpdates)
      .values({
        memberId: member.id,
        goalId: activeGoal.id,
        progressScore: parseInt(progressScore),
        notes: notes || null,
      })
      .returning();

    // Update the goal's current progress
    await db
      .update(goals)
      .set({
        currentProgress: parseInt(progressScore),
        updatedAt: new Date(),
      })
      .where(eq(goals.id, activeGoal.id));

    return NextResponse.json({
      success: true,
      progressUpdate,
    });
  } catch (error) {
    console.error("Error creating progress update:", error);
    return NextResponse.json(
      { error: "Failed to create progress update" },
      { status: 500 }
    );
  }
}
