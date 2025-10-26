"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MessageSquare, Phone, Calendar } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MatchPage() {
  const { data, error, isLoading } = useSWR("/api/member/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-600">Failed to load match data</p>;
  }

  const { currentMatch, partners } = data;

  const getCommunicationIcon = (method: string) => {
    const icons: Record<string, JSX.Element> = {
      email: <Mail className="w-5 h-5" />,
      text: <MessageSquare className="w-5 h-5" />,
      phone: <Phone className="w-5 h-5" />,
      "in-person": <Users className="w-5 h-5" />,
    };
    return icons[method] || <Mail className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My Match
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Your accountability partner details
        </p>
      </div>

      {currentMatch && partners && partners.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Match Type</p>
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#E0F2CC] text-[#053D3D] font-medium capitalize">
                  {currentMatch.match.matchType}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Matched on{" "}
                  {new Date(
                    currentMatch.matchMember.joinedAt
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Partner{partners.length > 1 ? "s" : ""}
            </h2>
            {partners.map((partner: any) => (
              <Card key={partner.member.id} className="border-[#A6FF48]">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {partner.member.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 break-all">
                        {partner.member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {partner.member.preferredCommunication &&
                        getCommunicationIcon(
                          partner.member.preferredCommunication
                        )}
                      <span className="text-xs sm:text-sm text-gray-700 capitalize">
                        {partner.member.preferredCommunication ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>

                  {partner.goal && (
                    <div className="p-4 bg-[#E0F2CC] rounded-lg">
                      <p className="text-sm font-semibold text-[#053D3D] mb-1">
                        Their Goal
                      </p>
                      <p className="text-sm text-gray-700 capitalize mb-2">
                        Category: {partner.goal.category}
                      </p>
                      <p className="text-gray-700">{partner.goal.goalText}</p>
                    </div>
                  )}

                  {partner.member.accountabilityStyle && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Accountability Style
                      </p>
                      <p className="text-sm text-gray-600">
                        {partner.member.accountabilityStyle}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#BCE8E7]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[#053D3D] mb-3">
                📅 Check-in Schedule
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Connect with your partner on these days:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-900">Monday</p>
                  <p className="text-sm text-gray-600">Partner Check-in</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-900">Thursday</p>
                  <p className="text-sm text-gray-600">Partner Check-in</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Not Matched Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on finding the perfect accountability partner for
              you. You'll receive an email notification within 1 week!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
