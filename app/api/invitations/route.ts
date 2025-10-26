import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { invitations, members } from "@/lib/db/schema";
import { getAdmin } from "@/lib/db/queries";
import { randomBytes } from "crypto";
import { desc, eq } from "drizzle-orm";

// GET - List all invitations (admin only)
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allInvitations = await db
      .select()
      .from(invitations)
      .orderBy(desc(invitations.createdAt));

    return NextResponse.json(allInvitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST - Create new invitation (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if member already exists with this email
    const existingMember = await db
      .select()
      .from(members)
      .where(eq(members.email, email))
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        {
          error: "A member with this email already exists in the system",
        },
        { status: 400 }
      );
    }

    // Check if there's an existing invitation for this email
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(eq(invitations.email, email))
      .orderBy(desc(invitations.createdAt))
      .limit(1);

    if (existingInvitation.length > 0) {
      const invitation = existingInvitation[0];

      // If invitation was accepted, don't allow resending
      if (invitation.status === "accepted") {
        return NextResponse.json(
          {
            error:
              "This email has already accepted an invitation. The member account exists.",
          },
          { status: 400 }
        );
      }

      // If invitation is pending or expired, allow resending with new token
      if (invitation.status === "pending" || invitation.status === "expired") {
        // Generate new token
        const newToken = randomBytes(32).toString("hex");
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);

        // Update existing invitation with new token and expiration
        const [updatedInvitation] = await db
          .update(invitations)
          .set({
            token: newToken,
            status: "pending",
            expiresAt: newExpiresAt,
          })
          .where(eq(invitations.id, invitation.id))
          .returning();

        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const inviteLink = `${baseUrl}/sign-up/${newToken}`;

        return NextResponse.json({
          invitation: updatedInvitation,
          inviteLink,
          message: "Invitation resent with new link",
        });
      }
    }

    // Create new invitation
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await db
      .insert(invitations)
      .values({
        email,
        token,
        status: "pending",
        expiresAt,
      })
      .returning();

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/sign-up/${token}`;

    return NextResponse.json(
      {
        invitation,
        inviteLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
