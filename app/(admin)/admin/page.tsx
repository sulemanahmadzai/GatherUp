"use client";

import useSWR from "swr";
import {
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  TrendingUp,
  Send,
  UsersRound,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboard() {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/api/admin/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your GatherUp admin dashboard
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      subtitle: `${stats.pendingMembers || 0} pending onboarding`,
      icon: Users,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Matches",
      value: stats.activeMatches,
      subtitle: `${stats.matchedMembers} members paired`,
      icon: UsersRound,
      color: "bg-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Unmatched Members",
      value: stats.unmatchedMembers,
      subtitle: "Waiting for match",
      icon: UserX,
      color: "bg-orange-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Pending Rematches",
      value: stats.pendingRematches,
      subtitle: "Requests to review",
      icon: AlertCircle,
      color: "bg-red-500",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Welcome back! Here's what's happening with your accountability
          community.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <stat.icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Goal Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Goal Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat: any) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#A6FF48]"></div>
                      <span className="text-sm text-gray-700 capitalize">
                        {cat.category}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active goals yet</p>
            )}
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Community Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E0F2CC] rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#053D3D]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Average Progress Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgProgressScore
                      ? Number(stats.avgProgressScore).toFixed(1)
                      : "0"}{" "}
                    / 12
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Health</span>
                  <span className="font-semibold text-gray-900">
                    {stats.avgProgressScore
                      ? `${Math.round((stats.avgProgressScore / 12) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#A6FF48] h-2 rounded-full transition-all"
                    style={{
                      width: stats.avgProgressScore
                        ? `${(stats.avgProgressScore / 12) * 100}%`
                        : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-[#A6FF48]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="/admin/invitations"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#A6FF48] hover:bg-[#E0F2CC] transition-all group"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 text-[#053D3D] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Invite Members
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Generate new invitation links
              </p>
            </a>
            <a
              href="/admin/matches"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#A6FF48] hover:bg-[#E0F2CC] transition-all group"
            >
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#053D3D] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Create Matches
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Pair members into accountability pods
              </p>
            </a>
            <a
              href="/admin/members"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#A6FF48] hover:bg-[#E0F2CC] transition-all group"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#053D3D] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                View Members
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Browse all members and their goals
              </p>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Members Alert */}
      {stats.inactiveMembers > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  Inactive Members Detected
                </h3>
                <p className="text-sm text-orange-800">
                  You have <strong>{stats.inactiveMembers}</strong> member(s)
                  who haven't been matched for over 7 days. Consider reaching
                  out or creating matches for them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
