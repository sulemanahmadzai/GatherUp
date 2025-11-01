"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X, Loader2 } from "lucide-react";
import MemberNav from "./MemberNav";

interface MemberLayoutClientProps {
  member: {
    id: number;
    name: string;
    email: string;
  };
  children: ReactNode;
}

export default function MemberLayoutClient({
  member,
  children,
}: MemberLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (response.ok || response.status === 303) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#053D3D] text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#053D3D] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-6 border-b border-[#0a5555]">
          <h1 className="text-2xl font-bold text-[#A6FF48]">GatherUp</h1>
          <p className="text-sm text-gray-300 mt-1">Member Dashboard</p>
        </div>

        <MemberNav onLinkClick={() => setSidebarOpen(false)} />

        <div className="p-4 border-t border-[#0a5555] mt-auto">
          <div className="px-4 py-3 bg-[#0a5555] rounded-lg mb-3">
            <p className="text-sm text-gray-300">Logged in as</p>
            <p className="font-medium truncate">{member.name}</p>
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-lg hover:bg-red-900/20 text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
