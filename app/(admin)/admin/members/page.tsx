"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Users, Search, Filter, Download, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [matchTypeFilter, setMatchTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Build query params
  const params = new URLSearchParams();
  if (statusFilter !== "all") params.append("status", statusFilter);
  if (matchTypeFilter !== "all") params.append("matchType", matchTypeFilter);
  if (categoryFilter !== "all") params.append("category", categoryFilter);
  if (searchTerm) params.append("search", searchTerm);

  const queryString = params.toString();
  const {
    data: members,
    error,
    isLoading,
  } = useSWR(`/api/members${queryString ? `?${queryString}` : ""}`, fetcher);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
          Pending
        </span>
      ),
      unmatched: (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
          Unmatched
        </span>
      ),
      matched: (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
          Matched
        </span>
      ),
      inactive: (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
          Inactive
        </span>
      ),
    };
    return badges[status] || null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const exportToCSV = () => {
    if (!members || members.length === 0) return;

    const headers = [
      "Name",
      "Email",
      "Status",
      "Goal Category",
      "Progress Score",
      "Match Type",
      "Joined Date",
    ];

    const rows = members.map((m: any) => [
      m.member.name,
      m.member.email,
      m.member.status,
      m.goal?.category || "No goal",
      m.goal?.currentProgress || "N/A",
      m.member.preferredMatchType || "N/A",
      formatDate(m.member.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Members
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Manage all members and their accountability journeys
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          variant="outline"
          disabled={!members || members.length === 0}
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Match Type
              </label>
              <Select
                value={matchTypeFilter}
                onValueChange={setMatchTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-on-one">1:1</SelectItem>
                  <SelectItem value="group">Group Pod</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Goal Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="mental-health">Mental Health</SelectItem>
                  <SelectItem value="habit">Habit Building</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load members
            </div>
          ) : members && members.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Goal
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Progress
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Match Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Joined
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((item: any, index: number) => (
                      <tr
                        key={`member-${item.member.id}-${
                          item.goal?.id || index
                        }`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.member.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">
                              {item.member.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                          {item.goal ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {item.goal.category}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {item.goal.goalText}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No goal set
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {item.goal ? (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-[#053D3D]" />
                              <span className="text-sm font-semibold text-gray-900">
                                {item.goal.currentProgress}/12
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.member.status)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize hidden xl:table-cell">
                          {item.member.preferredMatchType || "Not set"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                          {formatDate(item.member.createdAt)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/members/${item.member.id}`}
                            className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#053D3D] hover:text-[#0a5555] font-medium"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No members found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Invite members to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
