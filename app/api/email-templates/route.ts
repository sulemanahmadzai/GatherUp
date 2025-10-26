import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { emailTemplates } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

// GET /api/email-templates - List all email templates
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await db
      .select()
      .from(emailTemplates)
      .orderBy(emailTemplates.templateType);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

// POST /api/email-templates - Create new email template
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateType, subject, bodyHtml, bodyText, variables } = body;

    // Validation
    if (!name || !templateType || !subject || !bodyHtml || !bodyText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newTemplate] = await db
      .insert(emailTemplates)
      .values({
        name,
        templateType,
        subject,
        bodyHtml,
        bodyText,
        variables: variables || [],
        isActive: true,
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}
