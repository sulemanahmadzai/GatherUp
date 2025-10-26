"use client";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Menu, X } from "lucide-react";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: response } = useSWR<any>("/api/user", fetcher);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    await signOut();
    mutate("/api/user");
    router.push("/");
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        asChild
        className="rounded-full bg-[#053D3D] hover:bg-[#0a5555] text-white font-semibold px-6"
      >
        <Link href="/sign-in">Login</Link>
      </Button>
    );
  }

  // Not logged in - show Login button
  if (!response || !response.user) {
    return (
      <Button
        asChild
        className="rounded-full bg-[#053D3D] hover:bg-[#0a5555] text-white font-semibold px-6"
      >
        <Link href="/sign-in">Login</Link>
      </Button>
    );
  }

  const user = response.user;
  const role = response.role; // 'admin' or 'member'

  // Determine dashboard route based on role
  const dashboardRoute = role === "admin" ? "/admin" : "/member";

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9 border-2 border-[#A6FF48]">
          <AvatarImage alt={user.name || ""} />
          <AvatarFallback className="bg-[#E0F2CC] text-[#053D3D] font-bold">
            {user.name && user.name.trim()
              ? user.name
                  .trim()
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase() || "")
                  .join("")
              : user.email && user.email.includes("@")
              ? (user.email.split("@")[0][0] || "U").toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href={dashboardRoute} className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#053D3D] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-[#A6FF48] font-bold text-2xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#053D3D]">GatherUp</h1>
                <p className="text-xs text-gray-500 font-medium">
                  Accountability Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="text-sm font-semibold text-[#053D3D] hover:text-[#A6FF48] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-gray-700 hover:text-[#A6FF48] transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#features"
                className="text-sm font-medium text-gray-700 hover:text-[#A6FF48] transition-colors"
              >
                Features
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-700 hover:text-[#A6FF48] transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center gap-4">
              <Suspense
                fallback={
                  <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                }
              >
                <UserMenu />
              </Suspense>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#053D3D] hover:bg-[#E0F2CC] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-[#053D3D] hover:bg-[#E0F2CC] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E0F2CC] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/#features"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E0F2CC] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E0F2CC] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="px-4 pt-4 border-t border-gray-200">
                  <Suspense
                    fallback={
                      <div className="h-10 bg-gray-200 animate-pulse rounded-full" />
                    }
                  >
                    <UserMenu />
                  </Suspense>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
