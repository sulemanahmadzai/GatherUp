import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  rematchRequests,
  members,
  matches,
  matchMembers,
} from "@/lib/db/schema";
import {
  getAdmin,
  getMember,
  getPendingRematchRequests,
} from "@/lib/db/queries";
import { eq, and, isNull } from "drizzle-orm";
import { sendEmail } from "@/lib/email/service";

// GET - List all rematch requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let requestsData;

    if (status && status !== "pending") {
      // Get requests by specific status
      requestsData = await db
        .select({
          request: rematchRequests,
          member: members,
          match: matches,
        })
        .from(rematchRequests)
        .innerJoin(members, eq(rematchRequests.memberId, members.id))
        .leftJoin(matches, eq(rematchRequests.currentMatchId, matches.id))
        .where(eq(rematchRequests.status, status))
        .orderBy(rematchRequests.createdAt);
    } else {
      // Default to pending requests
      requestsData = await getPendingRematchRequests();
    }

    return NextResponse.json(requestsData);
  } catch (error) {
    console.error("Error fetching rematch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch rematch requests" },
      { status: 500 }
    );
  }
}

// POST - Submit rematch request (member only)
export async function POST(request: NextRequest) {
  try {
    const member = await getMember();
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reason, preferredMatchType, preferredPartner } = body;

    // Validation
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed reason (at least 10 characters)" },
        { status: 400 }
      );
    }

    // Get member's current match if they have one
    const currentMatch = await db
      .select({
        match: matches,
        matchMember: matchMembers,
      })
      .from(matchMembers)
      .innerJoin(matches, eq(matchMembers.matchId, matches.id))
      .where(
        and(
          eq(matchMembers.memberId, member.id),
          isNull(matchMembers.leftAt),
          eq(matches.status, "active")
        )
      )
      .limit(1);

    const currentMatchId =
      currentMatch.length > 0 ? currentMatch[0].match.id : null;

    // Check if member already has a pending request
    const existingRequest = await db
      .select()
      .from(rematchRequests)
      .where(
        and(
          eq(rematchRequests.memberId, member.id),
          eq(rematchRequests.status, "pending")
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      return NextResponse.json(
        {
          error:
            "You already have a pending rematch request. Please wait for admin approval.",
        },
        { status: 400 }
      );
    }

    // Create the rematch request
    const [newRequest] = await db
      .insert(rematchRequests)
      .values({
        memberId: member.id,
        currentMatchId,
        reason,
        preferredMatchType: preferredMatchType || null,
        preferredPartner: preferredPartner || null,
        status: "pending",
      })
      .returning();

    // Optionally notify admin via email
    try {
      // Get admin email (you might want to fetch this from your admin table)
      const adminUser = await db.select().from(members).limit(1); // Replace with actual admin query

      // For now, just log it
      console.log(`New rematch request from ${member.name}: ${reason}`);
    } catch (emailError) {
      console.error("Error notifying admin:", emailError);
    }

    return NextResponse.json(
      {
        request: newRequest,
        message: "Rematch request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rematch request:", error);
    return NextResponse.json(
      { error: "Failed to submit rematch request" },
      { status: 500 }
    );
  }
}
