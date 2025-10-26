"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  TrendingUp,
  Users,
  Settings,
  RefreshCw,
  LucideIcon,
} from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/member", label: "Dashboard", icon: Home },
  { href: "/member/goal", label: "My Goal", icon: Target },
  { href: "/member/progress", label: "Progress", icon: TrendingUp },
  { href: "/member/match", label: "My Match", icon: Users },
  { href: "/member/rematch", label: "Request Rematch", icon: RefreshCw },
  { href: "/member/settings", label: "Settings", icon: Settings },
];

interface MemberNavProps {
  onLinkClick?: () => void;
}

export default function MemberNav({ onLinkClick }: MemberNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/member") {
      return pathname === "/member";
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
