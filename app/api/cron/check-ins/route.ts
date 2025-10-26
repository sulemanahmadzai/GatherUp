import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, goals, matches, matchMembers } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/service";
import { eq, and } from "drizzle-orm";

// GET /api/cron/check-ins - Send check-in reminders to matched members
// Schedule: Every Monday and Thursday at 9:00 AM
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all matched members
    const matchedMembers = await db
      .select()
      .from(members)
      .where(eq(members.status, "matched"));

    if (matchedMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No matched members to send check-ins to",
        count: 0,
      });
    }

    // Send check-in emails
    const emailPromises = matchedMembers.map(async (member) => {
      try {
        // Get member's goal
        const [goal] = await db
          .select()
          .from(goals)
          .where(and(eq(goals.memberId, member.id), eq(goals.status, "active")))
          .limit(1);

        // Get partner info
        const memberMatches = await db
          .select({
            matchId: matchMembers.matchId,
          })
          .from(matchMembers)
          .where(eq(matchMembers.memberId, member.id));

        let partnerName = "";
        if (memberMatches.length > 0) {
          const matchId = memberMatches[0].matchId;
          const partners = await db
            .select({
              member: members,
            })
            .from(matchMembers)
            .innerJoin(members, eq(matchMembers.memberId, members.id))
            .where(eq(matchMembers.matchId, matchId));

          // Get first partner (not the member themselves)
          const partner = partners.find((p) => p.member.id !== member.id);
          if (partner) {
            partnerName = partner.member.name;
          }
        }

        await sendEmail({
          to: member.email,
          templateType: "check_in",
          variables: {
            memberName: member.name,
            goal: goal?.goalText || "your goal",
            partnerName: partnerName || "your accountability partner",
          },
          memberId: member.id,
        });

        return { success: true, email: member.email };
      } catch (error) {
        console.error(`Failed to send check-in to ${member.email}:`, error);
        return { success: false, email: member.email, error };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      message: `Check-in emails sent to ${successCount}/${matchedMembers.length} members`,
      total: matchedMembers.length,
      sent: successCount,
    });
  } catch (error) {
    console.error("Error sending check-in emails:", error);
    return NextResponse.json(
      { error: "Failed to send check-in emails" },
      { status: 500 }
    );
  }
}
