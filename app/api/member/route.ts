import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members } from "@/lib/db/schema";
import { getUser } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import { invalidateUserCache } from "@/lib/cache/helpers";

// PATCH /api/member - Update member profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user || user.role !== "member") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phoneNumber } = body;

    // Validation
    if (!name && !email && !phoneNumber) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Validate phone number if provided (allow empty string to clear it)
    if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
      // Remove any non-digit characters for validation (allow formatting but check actual digits)
      const digitsOnly = phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { error: "Phone number must contain at least 10 digits" },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken by another member
    if (email) {
      const [existingMember] = await db
        .select()
        .from(members)
        .where(eq(members.email, email));

      if (existingMember && existingMember.id !== user.id) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || null;

    const [updatedMember] = await db
      .update(members)
      .set(updateData)
      .where(eq(members.id, user.id))
      .returning({
        id: members.id,
        name: members.name,
        email: members.email,
        phoneNumber: members.phoneNumber,
      });

    // Invalidate cache
    await invalidateUserCache(user.id);

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member profile" },
      { status: 500 }
    );
  }
}
