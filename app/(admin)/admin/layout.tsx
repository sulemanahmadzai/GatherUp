import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/db/queries";
import AdminLayoutClient from "@/components/dashboard/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAdmin();
  console.log(
    "Admin layout - getAdmin() result:",
    admin ? "Found admin" : "No admin"
  );

  if (!admin) {
    console.log("Admin layout - redirecting to /sign-in");
    redirect("/sign-in");
  }

  return <AdminLayoutClient admin={admin}>{children}</AdminLayoutClient>;
}
