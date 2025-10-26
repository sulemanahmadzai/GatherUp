"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar, TrendingUp } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GoalPage() {
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
    return <p className="text-red-600">Failed to load goal data</p>;
  }

  const { goal } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          My Goal
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          View and manage your SMART goal
        </p>
      </div>

      {goal ? (
        <Card className="border-[#A6FF48]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-[#053D3D]" />
              Your Current Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs sm:text-sm rounded-full bg-[#E0F2CC] text-[#053D3D] font-medium capitalize mb-3">
                {goal.category}
              </span>
              <p className="text-lg sm:text-xl text-gray-900 leading-relaxed">
                {goal.goalText}
              </p>
            </div>

            {goal.measurableOutcome && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  How You'll Measure Success
                </h3>
                <p className="text-gray-600">{goal.measurableOutcome}</p>
              </div>
            )}

            {goal.targetDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-[#053D3D]" />
                <div>
                  <p className="text-sm text-gray-600">Target Date</p>
                  <p className="font-medium">{goal.targetDate}</p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                  Current Progress
                </h3>
                <span className="text-2xl sm:text-3xl font-bold text-[#053D3D]">
                  {goal.currentProgress}/12
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-[#A6FF48] h-4 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(goal.currentProgress / 12) * 100}%` }}
                >
                  {goal.currentProgress > 2 && (
                    <span className="text-xs font-bold text-[#053D3D]">
                      {Math.round((goal.currentProgress / 12) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-[#E0F2CC] rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#053D3D]" />
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Keep going!</span> You're{" "}
                {Math.round((goal.currentProgress / 12) * 100)}% of the way to
                your goal.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No goal set yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
