"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserCheck,
  Send,
  MessageSquare,
  Settings,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: UserCheck },
  { href: "/admin/invitations", label: "Invitations", icon: Send },
  {
    href: "/admin/communications",
    label: "Communications",
    icon: MessageSquare,
  },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminNavProps {
  onLinkClick?: () => void;
}

export default function AdminNav({ onLinkClick }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/admin") {
      return pathname === "/admin";
    }
    // For other routes, check if pathname starts with href
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
              active
                ? "bg-[#E0F2CC] text-[#053D3D]"
                : "hover:bg-[#0a5555] text-white"
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${
                active
                  ? "text-[#053D3D]"
                  : "text-gray-300 group-hover:text-[#A6FF48]"
              }`}
            />
            <span
              className={active ? "font-semibold" : "group-hover:text-white"}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
