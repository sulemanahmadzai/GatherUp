"use client";

import { User, Mail, Inbox, ListTodo, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";

interface ProfileItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  iconBg: string;
  iconColor: string;
}

const profileItems: ProfileItem[] = [
  {
    title: "My Profile",
    subtitle: "Account Settings",
    icon: <User className="w-5 h-5" />,
    href: "/dashboard/general",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "My Inbox",
    subtitle: "Messages & Emails",
    icon: <Inbox className="w-5 h-5" />,
    href: "/dashboard",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "My Tasks",
    subtitle: "To-do and Daily Tasks",
    icon: <ListTodo className="w-5 h-5" />,
    href: "/dashboard",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

interface ProfileDropdownProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const userName = user?.name || "User Account";
  const userEmail = user?.email || "user@example.com";
  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Member";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-orange-200 transition-all"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="/images/profile/user-1.jpg" alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-blue-500 text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-6">
        {/* User Profile Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            User Profile
          </h3>
          <div className="flex items-start gap-3 py-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/images/profile/user-1.jpg" alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-blue-500 text-white text-2xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {userName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{userRole}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-4" />

        {/* Profile Menu Items */}
        <div className="space-y-1">
          {profileItems.map((item) => (
            <DropdownMenuItem
              key={item.title}
              className="p-0 cursor-pointer focus:bg-transparent"
              onClick={() => router.push(item.href)}
            >
              <div className="flex items-start gap-3 py-3 px-2 w-full hover:bg-orange-50 rounded-lg transition-colors">
                <div
                  className={`w-11 h-11 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <div className={item.iconColor}>{item.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Upgrade Section */}

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full mt-5 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
