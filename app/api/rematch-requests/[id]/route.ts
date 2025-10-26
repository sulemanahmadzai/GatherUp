import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { rematchRequests, members } from "@/lib/db/schema";
import { getAdmin } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email/service";

// GET - Get single rematch request (admin only)
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const [requestData] = await db
      .select({
        request: rematchRequests,
        member: members,
      })
      .from(rematchRequests)
      .innerJoin(members, eq(rematchRequests.memberId, members.id))
      .where(eq(rematchRequests.id, requestId))
      .limit(1);

    if (!requestData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(requestData);
  } catch (error) {
    console.error("Error fetching rematch request:", error);
    return NextResponse.json(
      { error: "Failed to fetch rematch request" },
      { status: 500 }
    );
  }
}

// PATCH - Approve or deny rematch request (admin only)
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, adminNotes } = body;

    if (!action || !["approve", "deny"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'deny'" },
        { status: 400 }
      );
    }

    // Get the request to verify it exists and is pending
    const [existingRequest] = await db
      .select({
        request: rematchRequests,
        member: members,
      })
      .from(rematchRequests)
      .innerJoin(members, eq(rematchRequests.memberId, members.id))
      .where(eq(rematchRequests.id, requestId))
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (existingRequest.request.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Update the request status
    const newStatus = action === "approve" ? "approved" : "denied";

    const [updatedRequest] = await db
      .update(rematchRequests)
      .set({
        status: newStatus,
        adminNotes: adminNotes || null,
        resolvedAt: new Date(),
      })
      .where(eq(rematchRequests.id, requestId))
      .returning();

    // Send notification email to member
    try {
      const memberEmail = existingRequest.member.email;
      const memberName = existingRequest.member.name;

      let message = "";
      if (action === "approve") {
        message = `Your rematch request has been approved! We will pair you with a new accountability partner shortly. You'll receive an email notification once your new match is ready.`;
      } else {
        message = `Your rematch request has been reviewed. ${
          adminNotes
            ? `Admin note: ${adminNotes}`
            : "Please reach out if you have any questions."
        }`;
      }

      await sendEmail({
        to: memberEmail,
        subject: `Your rematch request has been ${
          action === "approve" ? "approved" : "reviewed"
        }`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Hi ${memberName},</h1>
            <p>${message}</p>
            ${
              adminNotes
                ? `<div style="background: #E0F2CC; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Admin Note:</strong> ${adminNotes}</p>
            </div>`
                : ""
            }
            <p>If you have any questions, please don't hesitate to reach out.</p>
            <p style="color: #666; margin-top: 30px;">Best regards,<br>The GatherUp Team</p>
          </div>
        `,
        text: `Hi ${memberName}, ${message}`,
      });
    } catch (emailError) {
      console.error("Error sending rematch response email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      request: updatedRequest,
      message: `Rematch request ${
        action === "approve" ? "approved" : "denied"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating rematch request:", error);
    return NextResponse.json(
      { error: "Failed to update rematch request" },
      { status: 500 }
    );
  }
}

// DELETE - Delete rematch request (admin only)
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    await db.delete(rematchRequests).where(eq(rematchRequests.id, requestId));

    return NextResponse.json({
      message: "Rematch request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rematch request:", error);
    return NextResponse.json(
      { error: "Failed to delete rematch request" },
      { status: 500 }
    );
  }
}
