import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { emailLogs } from "@/lib/db/schema";

// POST /api/emails/send-direct - Direct email sending (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, bodyHtml, bodyText, memberId } = body;

    // Check if SendGrid is configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const fromAddress =
      process.env.EMAIL_FROM_ADDRESS || "noreply@gatherup.com";
    const fromName = process.env.EMAIL_FROM_NAME || "GatherUp";

    let emailStatus = "sent";
    let errorMessage: string | null = null;

    if (sendGridApiKey) {
      // Send email via SendGrid
      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sendGridApiKey}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: fromAddress, name: fromName },
            subject,
            content: [
              { type: "text/plain", value: bodyText },
              { type: "text/html", value: bodyHtml },
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`SendGrid error: ${error}`);
        }

        console.log(`✅ Email sent to ${to} via SendGrid`);
      } catch (error: any) {
        console.error("SendGrid error:", error);
        emailStatus = "failed";
        errorMessage = error.message;
      }
    } else {
      // Log email to console (development mode)
      console.log("\n📧 EMAIL (Development Mode - SendGrid not configured)");
      console.log("=====================================");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("-------------------------------------");
      console.log(bodyText);
      console.log("=====================================\n");
    }

    // Log email to database
    await db.insert(emailLogs).values({
      recipientEmail: to,
      memberId: memberId || null,
      templateType: "manual",
      subject,
      status: emailStatus,
      errorMessage,
    });

    return NextResponse.json({ success: emailStatus === "sent" });
  } catch (error: any) {
    console.error("Error sending email:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
