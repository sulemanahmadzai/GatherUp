import { db } from "@/lib/db/drizzle";
import { emailLogs, emailTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface SendEmailParams {
  to: string;
  templateType: string;
  variables: Record<string, string>;
  memberId?: number;
}

// Replace template variables like {{memberName}} with actual values
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  });
  return result;
}

export async function sendEmail({
  to,
  templateType,
  variables,
  memberId,
}: SendEmailParams) {
  try {
    // Get email template
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.templateType, templateType))
      .limit(1);

    if (!template) {
      throw new Error(`Email template not found: ${templateType}`);
    }

    // Replace variables in subject and body
    const subject = replaceVariables(template.subject, variables);
    const bodyHtml = replaceVariables(template.bodyHtml, variables);
    const bodyText = replaceVariables(template.bodyText, variables);

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
      console.log(`Template: ${templateType}`);
      console.log("-------------------------------------");
      console.log(bodyText);
      console.log("=====================================\n");
    }

    // Log email to database
    await db.insert(emailLogs).values({
      recipientEmail: to,
      memberId,
      templateType,
      subject,
      status: emailStatus,
      errorMessage,
    });

    return { success: emailStatus === "sent", subject };
  } catch (error: any) {
    console.error("Error sending email:", error);

    // Log failed email
    await db.insert(emailLogs).values({
      recipientEmail: to,
      memberId,
      templateType,
      subject: `Failed: ${templateType}`,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
}
