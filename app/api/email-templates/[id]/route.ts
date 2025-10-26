import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { emailTemplates } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";

// PATCH /api/email-templates/[id] - Update email template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);
    const body = await request.json();
    const {
      name,
      templateType,
      subject,
      bodyHtml,
      bodyText,
      variables,
      isActive,
    } = body;

    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({
        name,
        templateType,
        subject,
        bodyHtml,
        bodyText,
        variables: variables || [],
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId))
      .returning();

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}

// DELETE /api/email-templates/[id] - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);

    await db.delete(emailTemplates).where(eq(emailTemplates.id, templateId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    );
  }
}
