import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email/service";
import { eq, inArray, ne } from "drizzle-orm";

// POST /api/emails/send - Send manual emails to members
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientType, selectedMembers, subject, bodyHtml, bodyText } =
      body;

    // Validation
    if (!subject || !bodyHtml || !bodyText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get recipients based on type
    let recipients: any[] = [];

    if (recipientType === "all") {
      // All members (excluding pending)
      recipients = await db
        .select()
        .from(members)
        .where(ne(members.status, "pending"));
    } else if (recipientType === "matched") {
      // Only matched members
      recipients = await db
        .select()
        .from(members)
        .where(eq(members.status, "matched"));
    } else if (recipientType === "unmatched") {
      // Only unmatched members
      recipients = await db
        .select()
        .from(members)
        .where(eq(members.status, "unmatched"));
    } else if (recipientType === "specific" && selectedMembers.length > 0) {
      // Specific members
      recipients = await db
        .select()
        .from(members)
        .where(inArray(members.id, selectedMembers));
    } else {
      return NextResponse.json(
        { error: "Invalid recipient type or no members selected" },
        { status: 400 }
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 }
      );
    }

    // Store template temporarily for manual sends
    // We'll use a custom template type for manual emails
    const emailPromises = recipients.map((member) => {
      // Replace basic variables
      const personalizedSubject = subject.replace(
        /\{\{memberName\}\}/g,
        member.name
      );
      const personalizedBodyHtml = bodyHtml.replace(
        /\{\{memberName\}\}/g,
        member.name
      );
      const personalizedBodyText = bodyText.replace(
        /\{\{memberName\}\}/g,
        member.name
      );

      // For manual emails, we'll directly insert into email logs
      // instead of using the sendEmail function which requires a template
      return db.query.emailLogs.findMany().then(() =>
        fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/emails/send-direct`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: member.email,
              subject: personalizedSubject,
              bodyHtml: personalizedBodyHtml,
              bodyText: personalizedBodyText,
              memberId: member.id,
            }),
          }
        )
      );
    });

    // Wait for all emails to be sent
    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Emails queued for ${recipients.length} recipient(s)`,
      count: recipients.length,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
