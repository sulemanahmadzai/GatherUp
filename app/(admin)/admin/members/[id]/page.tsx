"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, error, isLoading } = useSWR(`/api/members/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load member details</p>
          <Link href="/admin/members">
            <Button variant="outline">Back to Members</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { member, goal, progressHistory, currentMatch, partners } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: (
        <span className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700">
          Pending
        </span>
      ),
      unmatched: (
        <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
          Unmatched
        </span>
      ),
      matched: (
        <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
          Matched
        </span>
      ),
      inactive: (
        <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
          Inactive
        </span>
      ),
    };
    return badges[status] || null;
  };

  const getCommunicationIcon = (method: string) => {
    const icons: Record<string, JSX.Element> = {
      email: <Mail className="w-4 h-4" />,
      text: <MessageSquare className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      "in-person": <Users className="w-4 h-4" />,
    };
    return icons[method] || <Mail className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back Button */}
      <Link href="/admin/members">
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {member.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 break-all">
            {member.email}
          </p>
        </div>
        <div className="flex-shrink-0">{getStatusBadge(member.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Goal Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#053D3D]" />
                Current Goal
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

                  {goal.measurableOutcome && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Measurable Outcome
                      </h4>
                      <p className="text-gray-600">{goal.measurableOutcome}</p>
                    </div>
                  )}

                  {goal.targetDate && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Target Date
                      </h4>
                      <p className="text-gray-600">{goal.targetDate}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Current Progress
                      </h4>
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
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No goal set yet</p>
              )}
            </CardContent>
          </Card>

          {/* Progress History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#053D3D]" />
                Progress History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressHistory && progressHistory.length > 0 ? (
                <div className="space-y-3">
                  {progressHistory.map((update: any) => (
                    <div
                      key={update.progress.id}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-[#A6FF48] rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-[#053D3D]">
                          {update.progress.progressScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {formatDate(update.progress.createdAt)}
                        </p>
                        {update.progress.notes && (
                          <p className="text-gray-900 mt-1">
                            {update.progress.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No progress updates yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Match & Preferences */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Match Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-[#053D3D]" />
                Match Info
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
                    <p className="text-sm text-gray-600 mb-2">
                      Accountability Partner{partners.length > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-2">
                      {partners.map((partner: any) => (
                        <div
                          key={partner.member.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <p className="font-medium text-gray-900">
                            {partner.member.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {partner.member.email}
                          </p>
                          {partner.goal && (
                            <p className="text-xs text-gray-500 mt-1 capitalize">
                              Goal: {partner.goal.category}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Matched Since</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(currentMatch.matchMember.joinedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Not matched yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Preferred Communication
                </p>
                <div className="flex items-center gap-2">
                  {member.preferredCommunication &&
                    getCommunicationIcon(member.preferredCommunication)}
                  <span className="font-medium text-gray-900 capitalize">
                    {member.preferredCommunication || "Not specified"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Preferred Match Type
                </p>
                <p className="font-medium text-gray-900 capitalize">
                  {member.preferredMatchType || "Not specified"}
                </p>
              </div>

              {member.commitmentLevel && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Commitment Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#A6FF48] h-2 rounded-full"
                        style={{
                          width: `${(member.commitmentLevel / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {member.commitmentLevel}/10
                    </span>
                  </div>
                </div>
              )}

              {member.accountabilityStyle && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Accountability Style
                  </p>
                  <p className="text-gray-900">{member.accountabilityStyle}</p>
                </div>
              )}

              {member.knowsOtherMembers && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Knows Other Members
                  </p>
                  <p className="text-gray-900">{member.knowsOtherMembers}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Member Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(member.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Last Active:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(member.lastActiveAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
