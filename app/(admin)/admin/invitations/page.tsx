"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Send, Copy, Check, Mail, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InvitationsPage() {
  const {
    data: invitations,
    error,
    isLoading,
  } = useSWR("/api/invitations", fetcher);
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedLink(data.inviteLink);
        setEmail("");
        mutate("/api/invitations");
      } else {
        alert("Failed to create invitation");
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      alert("Failed to create invitation");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();

    if (isExpired && status === "pending") {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
          Expired
        </span>
      );
    }

    const badges: Record<string, JSX.Element> = {
      pending: (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
          Pending
        </span>
      ),
      accepted: (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
          Accepted
        </span>
      ),
      expired: (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
          Expired
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
          Invitations
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Generate and manage member invitation links
        </p>
      </div>

      {/* Create Invitation Card */}
      <Card className="border-[#A6FF48]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#053D3D]" />
            Create New Invitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm sm:text-base">
                Member Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                An invitation link will be generated for this email address
              </p>
            </div>
            <Button
              type="submit"
              disabled={isCreating || !email}
              className="bg-[#053D3D] hover:bg-[#0a5555] text-white w-full sm:w-auto"
            >
              {isCreating ? (
                "Generating..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    Generate Invitation Link
                  </span>
                  <span className="sm:hidden">Generate Link</span>
                </>
              )}
            </Button>
          </form>

          {/* Created Link Display */}
          {createdLink && (
            <div className="mt-6 p-3 sm:p-4 bg-[#E0F2CC] border border-[#A6FF48] rounded-lg">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                Invitation link created! ✅
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={createdLink}
                  readOnly
                  className="bg-white text-xs sm:text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(createdLink, "new")}
                  variant="outline"
                  className="flex-shrink-0 w-full sm:w-auto"
                >
                  {copiedToken === "new" ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Share this link with the member. It expires in 7 days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">Failed to load invitations</p>
          ) : invitations && invitations.length > 0 ? (
            <div className="space-y-3">
              {invitations.map((invitation: any) => {
                const baseUrl =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : process.env.NEXT_PUBLIC_BASE_URL ||
                      "http://localhost:3000";
                const inviteLink = `${baseUrl}/sign-up/${invitation.token}`;

                return (
                  <div
                    key={invitation.id}
                    className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="text-sm sm:text-base font-medium text-gray-900 break-all">
                            {invitation.email}
                          </span>
                          {getStatusBadge(
                            invitation.status,
                            invitation.expiresAt
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created {formatDate(invitation.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {formatDate(invitation.expiresAt)}
                          </span>
                        </div>
                        {invitation.status === "pending" && (
                          <div className="mt-2 flex flex-col sm:flex-row gap-2">
                            <Input
                              value={inviteLink}
                              readOnly
                              className="text-xs sm:text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                copyToClipboard(inviteLink, invitation.token)
                              }
                              variant="outline"
                              className="w-full sm:w-auto flex-shrink-0"
                            >
                              {copiedToken === invitation.token ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {invitation.status === "accepted" &&
                          invitation.acceptedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Accepted on {formatDate(invitation.acceptedAt)}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No invitations sent yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first invitation above to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
