"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TrendingUp, Save, CheckCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProgressPage() {
  const { data, error, isLoading } = useSWR("/api/member/dashboard", fetcher);

  const [progressScore, setProgressScore] = useState("5");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(false);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressScore: parseInt(progressScore),
          notes,
        }),
      });

      if (response.ok) {
        setSuccessMessage(true);
        setNotes("");
        mutate("/api/member/dashboard"); // Refresh dashboard data

        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        alert("Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-600">Failed to load progress data</p>;
  }

  const { goal, progressHistory } = data;

  const progressLabels: Record<number, string> = {
    1: "Just started",
    2: "Minimal progress",
    3: "Slight progress",
    4: "Some momentum",
    5: "Making progress",
    6: "Steady growth",
    7: "Good progress",
    8: "Strong momentum",
    9: "Excellent progress",
    10: "Outstanding",
    11: "Nearly there",
    12: "Goal achieved!",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Progress Tracking
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Track your journey towards your goal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Update Progress Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="border-[#A6FF48]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#053D3D]" />
                Update Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goal ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Goal:</p>
                    <p className="text-gray-900 font-medium">{goal.goalText}</p>
                  </div>

                  <div>
                    <Label
                      htmlFor="progressScore"
                      className="text-base font-semibold"
                    >
                      How are you doing? (1-12 scale)
                    </Label>
                    <div className="mt-4 space-y-4">
                      <div className="relative">
                        <input
                          id="progressScore"
                          type="range"
                          min="1"
                          max="12"
                          value={progressScore}
                          onChange={(e) => setProgressScore(e.target.value)}
                          className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-300 rounded-lg appearance-none cursor-pointer accent-[#053D3D]"
                          style={{
                            background: `linear-gradient(to right, #fecaca 0%, #fde68a ${
                              (parseInt(progressScore) / 12) * 50
                            }%, #86efac ${
                              (parseInt(progressScore) / 12) * 100
                            }%)`,
                          }}
                        />
                      </div>

                      <div className="flex justify-center">
                        <div className="text-center p-4 sm:p-6 bg-[#E0F2CC] rounded-lg border-2 border-[#A6FF48] w-full max-w-md">
                          <div className="text-4xl sm:text-5xl font-bold text-[#053D3D] mb-2">
                            {progressScore}
                          </div>
                          <p className="text-base sm:text-lg font-medium text-gray-900">
                            {progressLabels[parseInt(progressScore)]}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1 - Just started</span>
                        <span>6 - Halfway</span>
                        <span>12 - Achieved!</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What progress have you made? Any challenges or wins to share?"
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-700 font-medium">
                        Progress updated successfully!
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] font-semibold"
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Progress Update
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <p className="text-gray-600">No active goal set</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Stats */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Current Progress
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#A6FF48] h-3 rounded-full transition-all"
                          style={{
                            width: `${(goal.currentProgress / 12) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-[#053D3D]">
                        {goal.currentProgress}/12
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Goal Category</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {goal.category}
                    </p>
                  </div>

                  {goal.targetDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Target Date</p>
                      <p className="font-medium text-gray-900">
                        {goal.targetDate}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Updates</p>
                    <p className="font-medium text-gray-900">
                      {progressHistory?.length || 0} updates
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress History */}
      <Card>
        <CardHeader>
          <CardTitle>Progress History</CardTitle>
        </CardHeader>
        <CardContent>
          {progressHistory && progressHistory.length > 0 ? (
            <div className="space-y-3">
              {progressHistory.map((update: any) => {
                // Handle both nested and flat structures
                const progressData = update.progress || update;
                const progressScore = progressData.progressScore;
                const createdAt = progressData.createdAt;
                const notes = progressData.notes;

                return (
                  <div
                    key={progressData.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-[#A6FF48] rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-[#053D3D]">
                        {progressScore}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {progressLabels[progressScore]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {notes && (
                        <p className="text-gray-700 text-sm mt-2">{notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No progress updates yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Submit your first update above to start tracking!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
