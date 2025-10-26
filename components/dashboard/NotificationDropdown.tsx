"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  LogOut,
  Lock,
  UserCog,
  UserMinus,
  Mail,
  CheckCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";
// Activity types (would normally be imported from schema, but using inline for now)
type ActivityType =
  | "sign_up"
  | "sign_in"
  | "sign_out"
  | "update_password"
  | "delete_account"
  | "update_account"
  | "sent_invitation"
  | "verified_email";

const iconMap: Record<ActivityType, LucideIcon> = {
  sign_up: UserPlus,
  sign_in: UserCog,
  sign_out: LogOut,
  update_password: Lock,
  delete_account: UserMinus,
  update_account: Settings,
  sent_invitation: Mail,
  verified_email: CheckCircle,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case "sign_up":
      return "You signed up";
    case "sign_in":
      return "You signed in";
    case "sign_out":
      return "You signed out";
    case "update_password":
      return "Password changed";
    case "delete_account":
      return "Account deleted";
    case "update_account":
      return "Account updated";
    case "sent_invitation":
      return "Invitation sent";
    case "verified_email":
      return "Email verified";
    default:
      return "Unknown action";
  }
}

interface NotificationDropdownProps {
  logs: Array<{
    id: number;
    action: string;
    timestamp: string;
    ipAddress: string | null;
  }>;
}

export default function NotificationDropdown({
  logs,
}: NotificationDropdownProps) {
  const recentLogs = logs.slice(0, 5); // Show only 5 most recent
  const hasUnread = logs.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-blue-50">
          <h3 className="font-semibold text-foreground">
            Activity Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            {logs.length > 0
              ? `You have ${logs.length} activity log${
                  logs.length > 1 ? "s" : ""
                }`
              : "No recent activity"}
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => {
              const Icon = iconMap[log.action as ActivityType] || Settings;
              const formattedAction = formatAction(log.action as ActivityType);

              return (
                <DropdownMenuItem
                  key={log.id}
                  className="p-4 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 transition-colors"
                >
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {formattedAction}
                      </p>
                      {log.ipAddress && (
                        <p className="text-xs text-muted-foreground truncate">
                          IP: {log.ipAddress}
                        </p>
                      )}
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your activities will appear here
              </p>
            </div>
          )}
        </div>
        {logs.length > 5 && (
          <div className="p-3 border-t bg-gray-50 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {recentLogs.length} of {logs.length} activities
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
