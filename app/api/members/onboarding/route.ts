import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, goals } from "@/lib/db/schema";
import { getMember } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/service";
import { invalidateUserCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const member = await getMember();
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      goalText,
      category,
      targetDate,
      measurableOutcome,
      accountabilityStyle,
      commitmentLevel,
      preferredCommunication,
      preferredMatchType,
      knowsOtherMembers,
    } = body;

    // Validation
    if (!goalText || !category) {
      return NextResponse.json(
        { error: "Goal text and category are required" },
        { status: 400 }
      );
    }

    // Update member with onboarding preferences
    await db
      .update(members)
      .set({
        accountabilityStyle,
        commitmentLevel: parseInt(commitmentLevel) || 5,
        preferredCommunication,
        preferredMatchType,
        knowsOtherMembers,
        status: "unmatched", // Update status after onboarding
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(members.id, member.id));

    // Create the member's goal
    const [createdGoal] = await db
      .insert(goals)
      .values({
        memberId: member.id,
        goalText,
        category,
        targetDate,
        measurableOutcome,
        currentProgress: 1, // Starting progress
        status: "active",
      })
      .returning();

    // Invalidate user cache so the new status is reflected immediately
    await invalidateUserCache(member.id);

    // Send welcome email
    try {
      await sendEmail({
        to: member.email,
        templateType: "welcome",
        variables: {
          memberName: member.name,
        },
        memberId: member.id,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        status: "unmatched",
      },
      goal: createdGoal,
    });
  } catch (error) {
    console.error("Error processing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
