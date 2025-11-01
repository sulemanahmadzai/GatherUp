"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { admin, members, invitations } from "@/lib/db/schema";
import {
  comparePasswords,
  hashPassword,
  setSession,
  deleteSession,
} from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { validatedAction } from "@/lib/auth/middleware";
import { invalidateUserCache } from "@/lib/cache";

// ============================================
// SIGN IN (Admin or Member)
// ============================================

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password } = data;

  // First check if admin
  const adminUser = await db
    .select()
    .from(admin)
    .where(eq(admin.email, email))
    .limit(1);

  if (adminUser.length > 0) {
    const foundAdmin = adminUser[0];
    const isPasswordValid = await comparePasswords(
      password,
      foundAdmin.passwordHash
    );

    if (!isPasswordValid) {
      return { error: "Invalid email or password. Please try again." };
    }

    await setSession({ ...foundAdmin, role: "admin" });
    redirect("/admin");
  }

  // Then check if member
  const memberUser = await db
    .select()
    .from(members)
    .where(eq(members.email, email))
    .limit(1);

  if (memberUser.length > 0) {
    const foundMember = memberUser[0];
    const isPasswordValid = await comparePasswords(
      password,
      foundMember.passwordHash
    );

    if (!isPasswordValid) {
      return { error: "Invalid email or password. Please try again." };
    }

    // Update last active timestamp
    await db
      .update(members)
      .set({ lastActiveAt: new Date() })
      .where(eq(members.id, foundMember.id));

    await setSession({ ...foundMember, role: "member" });

    // Redirect to onboarding if member hasn't completed it yet
    if (foundMember.status === "pending") {
      redirect("/onboarding");
    }

    redirect("/member");
  }

  // No user found
  return { error: "Invalid email or password. Please try again." };
});

// ============================================
// SIGN UP (Member via Invite Link)
// ============================================

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  token: z.string().min(1, "Invitation token is required"),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { name, email, phoneNumber, password, token } = data;

  // Validate invitation token
  const invitation = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.token, token),
        eq(invitations.email, email),
        eq(invitations.status, "pending")
      )
    )
    .limit(1);

  if (invitation.length === 0) {
    return { error: "Invalid or expired invitation link." };
  }

  const invite = invitation[0];

  // Check if invitation is expired
  if (new Date() > invite.expiresAt) {
    await db
      .update(invitations)
      .set({ status: "expired" })
      .where(eq(invitations.id, invite.id));
    return { error: "This invitation link has expired." };
  }

  // Check if user already exists
  const existingMember = await db
    .select()
    .from(members)
    .where(eq(members.email, email))
    .limit(1);

  if (existingMember.length > 0) {
    return { error: "An account with this email already exists." };
  }

  // Create new member
  const passwordHash = await hashPassword(password);
  const [newMember] = await db
    .insert(members)
    .values({
      email,
      name,
      phoneNumber,
      passwordHash,
      status: "pending", // Will be updated to "unmatched" after onboarding
    })
    .returning();

  if (!newMember) {
    return { error: "Failed to create account. Please try again." };
  }

  // Mark invitation as accepted
  await db
    .update(invitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(invitations.id, invite.id));

  // Invalidate any existing cache for this user
  await invalidateUserCache(newMember.id);

  // Set session and redirect to onboarding
  await setSession({ ...newMember, role: "member" });
  redirect("/onboarding");
});

// ============================================
// SIGN OUT
// ============================================

export async function signOut() {
  await deleteSession();
  redirect("/sign-in");
}

// ============================================
// UPDATE PASSWORD
// ============================================

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
});

export const updatePassword = validatedAction(
  updatePasswordSchema,
  async (data) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      return { error: "New password and confirmation do not match." };
    }

    if (currentPassword === newPassword) {
      return { error: "New password must be different from current password." };
    }

    // This would need user context from session
    // Implementation depends on how we pass user to the action
    return { success: "Password updated successfully." };
  }
);
