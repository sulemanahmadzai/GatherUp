"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MemberDashboardPage() {
  // This will fetch current member's data - we'll create this API route
  const { data, error, isLoading } = useSWR("/api/member/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const { member, goal, currentMatch, partners, progressHistory } = data;

  const getCommunicationIcon = (method: string) => {
    const icons: Record<string, React.ReactElement> = {
      email: <Mail className="w-4 h-4" />,
      text: <MessageSquare className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      "in-person": <Users className="w-4 h-4" />,
    };
    return icons[method] || <Mail className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactElement> = {
      pending: (
        <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
          Pending Setup
        </span>
      ),
      unmatched: (
        <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
          Finding Partner...
        </span>
      ),
      matched: (
        <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
          Matched!
        </span>
      ),
    };
    return badges[status] || null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {member.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Keep pushing towards your goals with your accountability partner
        </p>
      </div>

      {/* Status Badge */}
      <div>{getStatusBadge(member.status)}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Goal Card */}
        <Card className="border-[#A6FF48]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#053D3D]" />
              Your Current Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goal ? (
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#E0F2CC] text-[#053D3D] font-medium capitalize mb-3">
                    {goal.category}
                  </span>
                  <p className="text-lg text-gray-900">{goal.goalText}</p>
                </div>

                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Target: {goal.targetDate}</span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Current Progress
                    </span>
                    <span className="text-2xl font-bold text-[#053D3D]">
                      {goal.currentProgress}/12
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#A6FF48] h-3 rounded-full transition-all"
                      style={{
                        width: `${(goal.currentProgress / 12) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <Link href="/member/progress">
                  <Button className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Update Progress
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No goal set yet</p>
                <Link href="/onboarding">
                  <Button className="bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D]">
                    Complete Onboarding
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#053D3D]" />
              Accountability Partner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMatch && partners && partners.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Match Type</p>
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#E0F2CC] text-[#053D3D] font-medium capitalize">
                    {currentMatch.match.matchType}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Your Partner{partners.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-3">
                    {partners.map((partner: any) => (
                      <div
                        key={partner.member.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">
                            {partner.member.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            {partner.member.preferredCommunication &&
                              getCommunicationIcon(
                                partner.member.preferredCommunication
                              )}
                            <span className="capitalize">
                              {partner.member.preferredCommunication}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {partner.member.email}
                        </p>
                        {partner.member.phoneNumber && (
                          <p className="text-sm text-gray-600 mb-1">
                            {partner.member.phoneNumber}
                          </p>
                        )}
                        {partner.goal && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Goal:</span>{" "}
                            {partner.goal.category}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/member/match">
                    <Button variant="outline" className="w-full">
                      View Match Details
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="font-medium text-gray-900 mb-2">
                  Finding Your Perfect Match
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  We're working on pairing you with an accountability partner.
                  You'll receive an email notification within 1 week!
                </p>
                <div className="p-4 bg-[#E0F2CC] rounded-lg text-left">
                  <p className="text-sm font-medium text-[#053D3D] mb-2">
                    While you wait:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#053D3D] flex-shrink-0 mt-0.5" />
                      <span>Track your progress daily</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#053D3D] flex-shrink-0 mt-0.5" />
                      <span>Refine your SMART goal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#053D3D] flex-shrink-0 mt-0.5" />
                      <span>Start building your routine</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Progress */}
      {progressHistory && progressHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#053D3D]" />
              Recent Progress Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressHistory.slice(0, 5).map((update: any) => {
                // Handle both nested and flat structures
                const progressData = update.progress || update;
                const progressScore = progressData.progressScore;
                const createdAt = progressData.createdAt;
                const notes = progressData.notes;

                return (
                  <div
                    key={progressData.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#A6FF48] rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-[#053D3D]">
                        {progressScore}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {new Date(createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {notes && (
                        <p className="text-gray-900 text-sm mt-1">{notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/member/progress" className="block mt-4">
              <Button variant="outline" className="w-full">
                View All Progress
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Check-in Schedule */}
      <Card className="bg-[#BCE8E7] border-[#053D3D]">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#053D3D] mb-3">
            📅 Your Check-in Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-gray-900">Monday</p>
              <p className="text-gray-600">Partner Check-in</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-gray-900">Wednesday</p>
              <p className="text-gray-600">Reflection Prompt</p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="font-medium text-gray-900">Thursday</p>
              <p className="text-gray-600">Partner Check-in</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
