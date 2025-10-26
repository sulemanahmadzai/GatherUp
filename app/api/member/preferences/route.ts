import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { invalidateUserCache } from "@/lib/cache/helpers";

// PATCH /api/member/preferences - Update member preferences
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "member") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { preferredCommunication, preferredMatchType } = body;

    // Validation
    const validCommunicationMethods = ["email", "text", "phone", "in-person"];
    const validMatchTypes = ["one-on-one", "group"];

    if (
      preferredCommunication &&
      !validCommunicationMethods.includes(preferredCommunication)
    ) {
      return NextResponse.json(
        { error: "Invalid communication method" },
        { status: 400 }
      );
    }

    if (preferredMatchType && !validMatchTypes.includes(preferredMatchType)) {
      return NextResponse.json(
        { error: "Invalid match type" },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };
    if (preferredCommunication)
      updateData.preferredCommunication = preferredCommunication;
    if (preferredMatchType) updateData.preferredMatchType = preferredMatchType;

    const [updatedMember] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, user.id))
      .returning({
        id: members.id,
        preferredCommunication: members.preferredCommunication,
        preferredMatchType: members.preferredMatchType,
      });

    // Invalidate cache
    await invalidateUserCache(user.id);

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
