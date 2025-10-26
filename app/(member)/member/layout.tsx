import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/db/queries";
import MemberLayoutClient from "@/components/dashboard/MemberLayoutClient";

export default async function MemberDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const member = await getMember();

  console.log(
    "[MemberLayout] Member data:",
    member
      ? `ID: ${member.id}, Email: ${member.email}, Status: ${
          (member as any).status || "N/A"
        }`
      : "NULL"
  );

  if (!member) {
    console.log("[MemberLayout] No member found, redirecting to sign-in");
    redirect("/sign-in");
  }

  // Redirect to onboarding if member hasn't completed it yet
  if ((member as any).status === "pending") {
    console.log(
      "[MemberLayout] Member has pending status, redirecting to onboarding"
    );
    redirect("/onboarding");
  }

  return <MemberLayoutClient member={member}>{children}</MemberLayoutClient>;
}
