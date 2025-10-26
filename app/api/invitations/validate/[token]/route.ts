import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { invitations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(eq(invitations.token, token), eq(invitations.status, "pending"))
      )
      .limit(1);

    if (invitation.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Invalid invitation link" },
        { status: 404 }
      );
    }

    const invite = invitation[0];

    // Check if expired
    if (new Date() > invite.expiresAt) {
      // Update status to expired
      await db
        .update(invitations)
        .set({ status: "expired" })
        .where(eq(invitations.id, invite.id));

      return NextResponse.json(
        { valid: false, error: "This invitation link has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
