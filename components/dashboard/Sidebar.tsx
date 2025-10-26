"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  ChevronRight,
  Home,
  Briefcase,
  DollarSign,
  Mail,
  Calendar,
  UserCircle,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Staff",
    href: "/dashboard/staff",
    icon: <UserCircle className="w-5 h-5" />,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

const portfolioItems: MenuItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: "About",
    href: "/about",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    title: "Services",
    href: "/services",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: <Mail className="w-5 h-5" />,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export default function Sidebar({
  isOpen = true,
  onClose,
  user,
}: SidebarProps) {
  const pathname = usePathname();

  const userName = user?.name || "User Account";
  const userEmail = user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Modernize
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* Dashboard Section */}
            <div className="mb-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dashboard
                </h3>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {item.children && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Portfolio Section */}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
