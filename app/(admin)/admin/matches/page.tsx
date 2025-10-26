"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Users,
  Plus,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MatchesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRematchRequests, setShowRematchRequests] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [matchType, setMatchType] = useState<"one-on-one" | "pod">(
    "one-on-one"
  );
  const [matchNotes, setMatchNotes] = useState("");
  const [sendNotifications, setSendNotifications] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch matches and unmatched members
  const {
    data,
    error: fetchError,
    isLoading,
  } = useSWR("/api/matches?includeUnmatched=true", fetcher, {
    refreshInterval: 30000,
  });

  // Fetch rematch requests
  const {
    data: rematchData,
    error: rematchError,
    isLoading: rematchLoading,
  } = useSWR("/api/rematch-requests", fetcher, { refreshInterval: 30000 });

  const matches = data?.matches || [];
  const unmatchedMembers = data?.unmatchedMembers || [];
  const rematchRequests = rematchData || [];

  // Filter unmatched members
  const filteredMembers = unmatchedMembers.filter((item: any) => {
    const member = item.member;
    const goal = item.goal;

    // Category filter
    if (filterCategory !== "all" && goal?.category !== filterCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        goal?.category?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleCreateMatch = async () => {
    setError(null);
    setSuccess(null);

    if (selectedMembers.length < 2) {
      setError("Please select at least 2 members");
      return;
    }

    if (matchType === "one-on-one" && selectedMembers.length !== 2) {
      setError("One-on-one matches require exactly 2 members");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberIds: selectedMembers,
          matchType,
          notes: matchNotes,
          sendNotifications,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Match created successfully!");
        setShowCreateModal(false);
        setSelectedMembers([]);
        setMatchNotes("");
        setMatchType("one-on-one");
        mutate("/api/matches?includeUnmatched=true");
      } else {
        setError(result.error || "Failed to create match");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDissolveMatch = async (matchId: number) => {
    if (!confirm("Are you sure you want to dissolve this match?")) return;

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Match dissolved successfully");
        mutate("/api/matches?includeUnmatched=true");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to dissolve match");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleRematchAction = async (
    requestId: number,
    action: "approve" | "deny"
  ) => {
    try {
      const response = await fetch(`/api/rematch-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNotes: prompt(
            `${action === "approve" ? "Approval" : "Denial"} note (optional):`
          ),
        }),
      });

      if (response.ok) {
        setSuccess(
          `Rematch request ${action === "approve" ? "approved" : "denied"}`
        );
        mutate("/api/rematch-requests");
        mutate("/api/matches?includeUnmatched=true");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to process request");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const toggleMemberSelection = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      // For one-on-one, limit to 2 members
      if (matchType === "one-on-one" && selectedMembers.length >= 2) {
        setSelectedMembers([selectedMembers[1], memberId]);
      } else {
        setSelectedMembers([...selectedMembers, memberId]);
      }
    }
  };

  const getCompatibilityScore = (member1: any, member2: any) => {
    let score = 0;
    if (member1.goal?.category === member2.goal?.category) score += 40;
    if (member1.member.preferredMatchType === member2.member.preferredMatchType)
      score += 30;
    if (
      member1.member.preferredCommunication ===
      member2.member.preferredCommunication
    )
      score += 30;
    return score;
  };

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Accountability Matches
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Create and manage accountability partnerships
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setShowRematchRequests(!showRematchRequests)}
            variant="outline"
            className="relative w-full sm:w-auto"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Rematch Requests</span>
            <span className="sm:hidden">Requests</span>
            {rematchRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500">
                {rematchRequests.length}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#053D3D] hover:bg-[#0a5555] text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Match
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Rematch Requests Section */}
      {showRematchRequests && rematchRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Rematch Requests ({rematchRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rematchRequests.map((req: any) => (
                <div
                  key={req.request.id}
                  className="p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {req.member.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {req.request.reason}
                      </p>
                      {req.request.preferredMatchType && (
                        <p className="text-xs text-gray-500 mt-2">
                          Prefers: {req.request.preferredMatchType}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Requested:{" "}
                        {new Date(req.request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleRematchAction(req.request.id, "approve")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleRematchAction(req.request.id, "deny")
                        }
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Active Matches
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {matches.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Unmatched Members
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {unmatchedMembers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pending Requests
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {rematchRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Matches List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No active matches yet. Create your first match!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match: any) => (
                <div
                  key={match.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#A6FF48] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {match.matchType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {match.members.map((m: any, idx: number) => (
                          <div
                            key={`match-${match.id}-member-${m.member.id}-${idx}`}
                            className="p-3 bg-gray-50 rounded border border-gray-200"
                          >
                            <p className="text-sm sm:text-base font-semibold text-gray-900">
                              {m.member.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              {m.member.email}
                            </p>
                            {m.goal && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-[#E0F2CC] text-[#053D3D] rounded capitalize">
                                {m.goal.category}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {match.notes && (
                        <p className="text-sm text-gray-600 mt-3 italic">
                          Note: {match.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDissolveMatch(match.id)}
                      className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Dissolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Match Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Match</CardTitle>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Match Type Selection */}
              <div>
                <Label>Match Type</Label>
                <Select
                  value={matchType}
                  onValueChange={(value: "one-on-one" | "pod") =>
                    setMatchType(value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-on-one">1:1 Partner</SelectItem>
                    <SelectItem value="pod">Group Pod (3-5 people)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {matchType === "one-on-one"
                    ? "Select exactly 2 members"
                    : "Select 3-5 members"}
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Filter by Goal Category</Label>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="mental-health">
                        Mental Health
                      </SelectItem>
                      <SelectItem value="habit">Habit Building</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="relationships">
                        Relationships
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Search Members</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900 mb-2">
                    Selected: {selectedMembers.length}{" "}
                    {matchType === "one-on-one" && "/ 2"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((id) => {
                      const memberData = filteredMembers.find(
                        (m: any) => m.member.id === id
                      );
                      return (
                        <Badge
                          key={id}
                          className="bg-green-600 cursor-pointer"
                          onClick={() => toggleMemberSelection(id)}
                        >
                          {memberData?.member.name}{" "}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Unmatched Members List */}
              <div>
                <Label>Unmatched Members ({filteredMembers.length})</Label>
                <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredMembers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No unmatched members found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredMembers.map((item: any, index: number) => {
                        const isSelected = selectedMembers.includes(
                          item.member.id
                        );
                        return (
                          <div
                            key={`unmatched-${item.member.id}-${
                              item.goal?.id || index
                            }`}
                            onClick={() =>
                              toggleMemberSelection(item.member.id)
                            }
                            className={`p-3 cursor-pointer hover:bg-gray-50 ${
                              isSelected ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {item.member.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.member.email}
                                </p>
                                {item.goal && (
                                  <div className="flex gap-2 mt-2">
                                    <span className="inline-block px-2 py-1 text-xs bg-[#E0F2CC] text-[#053D3D] rounded capitalize">
                                      {item.goal.category}
                                    </span>
                                    {item.member.preferredMatchType && (
                                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded capitalize">
                                        {item.member.preferredMatchType}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this match..."
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Send Notifications */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendNotifications"
                  checked={sendNotifications}
                  onChange={(e) => setSendNotifications(e.target.checked)}
                  className="w-4 h-4 text-[#053D3D] rounded"
                />
                <Label htmlFor="sendNotifications" className="cursor-pointer">
                  Send email notifications to members
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateMatch}
                  disabled={isCreating || selectedMembers.length < 2}
                  className="flex-1 bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] font-semibold"
                >
                  {isCreating ? "Creating..." : "Create Match"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
