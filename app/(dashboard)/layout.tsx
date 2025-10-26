"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/dashboard");

  // Dashboard routes have their own layout with sidebar and header
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Portfolio routes use the standard header
  return (
    <div className="min-h-screen">
      <Header />
      <main className="relative">{children}</main>
    </div>
  );
}
