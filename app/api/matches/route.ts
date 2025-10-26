import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { matches, matchMembers, members, goals } from "@/lib/db/schema";
import { getAdmin, getAllMatches, getUnmatchedMembers } from "@/lib/db/queries";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { sendEmail } from "@/lib/email/service";
import { invalidateUserCache } from "@/lib/cache";

// GET - List all active matches (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeUnmatched = searchParams.get("includeUnmatched") === "true";

    const matchesData = await getAllMatches();

    // Optionally include unmatched members
    let unmatchedMembers = [];
    if (includeUnmatched) {
      unmatchedMembers = await getUnmatchedMembers();
    }

    return NextResponse.json({
      matches: matchesData,
      unmatchedMembers: includeUnmatched ? unmatchedMembers : undefined,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// POST - Create new match (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { memberIds, matchType, notes, sendNotifications } = body;

    // Validation
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 members are required to create a match" },
        { status: 400 }
      );
    }

    if (!matchType || !["one-on-one", "pod"].includes(matchType)) {
      return NextResponse.json(
        { error: "Invalid match type. Must be 'one-on-one' or 'pod'" },
        { status: 400 }
      );
    }

    // For one-on-one, only allow exactly 2 members
    if (matchType === "one-on-one" && memberIds.length !== 2) {
      return NextResponse.json(
        { error: "One-on-one matches require exactly 2 members" },
        { status: 400 }
      );
    }

    // Create the match
    const [newMatch] = await db
      .insert(matches)
      .values({
        matchType,
        notes: notes || null,
        status: "active",
      })
      .returning();

    // Add members to the match
    const matchMemberInserts = memberIds.map((memberId: number) => ({
      matchId: newMatch.id,
      memberId,
    }));

    await db.insert(matchMembers).values(matchMemberInserts);

    // Update member statuses to "matched"
    await db
      .update(members)
      .set({
        status: "matched",
        matchedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(members.id, memberIds));

    // Invalidate cache for all matched members
    for (const memberId of memberIds) {
      await invalidateUserCache(memberId);
    }

    // Fetch full match data with members
    const fullMatchData = await db
      .select({
        member: members,
        goal: goals,
        matchMember: matchMembers,
      })
      .from(matchMembers)
      .innerJoin(members, eq(matchMembers.memberId, members.id))
      .leftJoin(
        goals,
        and(eq(goals.memberId, members.id), eq(goals.status, "active"))
      )
      .where(eq(matchMembers.matchId, newMatch.id));

    // Send notification emails if requested
    if (sendNotifications) {
      try {
        // Send email to each member with their partner(s) info
        for (const memberData of fullMatchData) {
          const currentMember = memberData.member;
          const partners = fullMatchData
            .filter((m) => m.member.id !== currentMember.id)
            .map((m) => m.member);

          // Get the email template for match notifications
          const partnerNames = partners.map((p) => p.name).join(", ");
          const partnerGoals = fullMatchData
            .filter((m) => m.member.id !== currentMember.id && m.goal)
            .map((m) => `${m.member.name}: ${m.goal?.category}`)
            .join("; ");

          await sendEmail({
            to: currentMember.email,
            subject: "You've been matched with an accountability partner! 🤝",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #053D3D;">Great news, ${
                  currentMember.name
                }!</h1>
                <p>You've been matched with <strong>${partnerNames}</strong>!</p>
                <div style="background: #E0F2CC; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Partner Details:</h3>
                  ${partners
                    .map(
                      (p) => `
                    <div style="margin-bottom: 10px;">
                      <p><strong>Name:</strong> ${p.name}</p>
                      <p><strong>Preferred Contact:</strong> ${
                        p.preferredCommunication || "Not specified"
                      }</p>
                      <p><strong>Email:</strong> ${p.email}</p>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                <p>We encourage you to reach out and start your accountability journey together!</p>
                <p style="color: #666; margin-top: 30px;">Best regards,<br>The GatherUp Team</p>
              </div>
            `,
            text: `Great news, ${currentMember.name}! You've been matched with ${partnerNames}. Reach out and start your accountability journey!`,
          });
        }
      } catch (emailError) {
        console.error("Error sending match notification emails:", emailError);
        // Don't fail the match creation if emails fail
      }
    }

    return NextResponse.json(
      {
        match: newMatch,
        members: fullMatchData,
        message: "Match created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
