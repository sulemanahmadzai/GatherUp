"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Users, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RematchPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [preferredMatchType, setPreferredMatchType] = useState("");
  const [preferredPartner, setPreferredPartner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch member dashboard data to show current match
  const {
    data,
    error: fetchError,
    isLoading,
  } = useSWR("/api/member/dashboard", fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!reason || reason.trim().length < 10) {
      setError("Please provide a detailed reason (at least 10 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rematch-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
          preferredMatchType: preferredMatchType || null,
          preferredPartner: preferredPartner || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(
          "Your rematch request has been submitted! The admin will review it shortly and you'll receive an email notification."
        );
        setReason("");
        setPreferredMatchType("");
        setPreferredPartner("");
        mutate("/api/member/dashboard");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/member");
        }, 3000);
      } else {
        setError(result.error || "Failed to submit rematch request");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const { member, currentMatch, partners, rematchRequest } = data || {};
  const isMatched = currentMatch && partners && partners.length > 0;
  const hasPendingRequest = rematchRequest?.status === "pending";
  const hasApprovedRequest = rematchRequest?.status === "approved";
  const hasDeniedRequest = rematchRequest?.status === "denied";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Rematch</h1>
        <p className="text-gray-600 mt-2">
          Request a new accountability partner
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Request Submitted!</p>
              <p className="text-green-700 text-sm mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Match Info */}
      {isMatched && (
        <Card className="border-[#053D3D]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Current Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                      <p className="font-semibold text-gray-900">
                        {partner.member.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {partner.member.email}
                      </p>
                      {partner.member.phoneNumber && (
                        <p className="text-sm text-gray-600">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Matched Warning */}
      {!isMatched && !hasPendingRequest && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Not Matched Yet</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You're not currently matched with an accountability partner.
                  You cannot request a rematch until you have been matched. The
                  admin is working on finding you a suitable match!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Request Status - Only show if matched */}
      {isMatched && hasPendingRequest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Request Pending</p>
                <p className="text-blue-700 text-sm mt-1">
                  You have a rematch request pending admin review. You'll
                  receive an email notification once it's been reviewed.
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium">
                    Your Request:
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {rematchRequest.reason}
                  </p>
                  {rematchRequest.preferredMatchType && (
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Preferred Type:</span>{" "}
                      <span className="capitalize">
                        {rematchRequest.preferredMatchType}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted:{" "}
                    {new Date(rematchRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Request Status - Only show if matched */}
      {isMatched && hasApprovedRequest && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">
                  Request Approved! 🎉
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Your rematch request has been approved! You will be matched
                  with a new accountability partner within 1 week. We'll send
                  you an email with your new partner's details once the match is
                  made.
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <p className="text-xs text-gray-600 font-medium">
                    Your Request:
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {rematchRequest.reason}
                  </p>
                  {rematchRequest.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-xs text-gray-600 font-medium">
                        Admin Notes:
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {rematchRequest.adminNotes}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Approved:{" "}
                    {rematchRequest.resolvedAt
                      ? new Date(rematchRequest.resolvedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Denied Request Status - Only show if matched */}
      {isMatched && hasDeniedRequest && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Request Denied</p>
                <p className="text-red-700 text-sm mt-1">
                  Your rematch request was not approved at this time. You can
                  submit a new request below if you still need a rematch.
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <p className="text-xs text-gray-600 font-medium">
                    Your Request:
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {rematchRequest.reason}
                  </p>
                  {rematchRequest.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs text-gray-600 font-medium">
                        Admin Response:
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {rematchRequest.adminNotes}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Denied:{" "}
                    {rematchRequest.resolvedAt
                      ? new Date(rematchRequest.resolvedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rematch Request Form - Only show if matched and no pending request */}
      {isMatched && !hasPendingRequest && (
        <Card>
          <CardHeader>
            <CardTitle>
              {hasApprovedRequest || hasDeniedRequest
                ? "Submit New Rematch Request"
                : "Submit Rematch Request"}
            </CardTitle>
            {(hasApprovedRequest || hasDeniedRequest) && (
              <p className="text-sm text-gray-600 mt-2">
                You can submit a new rematch request if needed.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div>
                <Label htmlFor="reason">
                  Reason for Rematch Request{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why you'd like to be matched with a different accountability partner. Be honest and respectful - this helps us find you a better match."
                  rows={5}
                  className="mt-1"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters ({reason.length}/10)
                </p>
              </div>

              {/* Preferred Match Type */}
              <div>
                <Label htmlFor="preferredMatchType">
                  Preferred Match Type (Optional)
                </Label>
                <Select
                  value={preferredMatchType}
                  onValueChange={setPreferredMatchType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select if you have a preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-on-one">1:1 Partner</SelectItem>
                    <SelectItem value="pod">Group Pod (3-5 people)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Let us know if you'd prefer a different type of accountability
                  setup
                </p>
              </div>

              {/* Preferred Partner */}
              <div>
                <Label htmlFor="preferredPartner">
                  Preferred Partner (Optional)
                </Label>
                <Input
                  id="preferredPartner"
                  value={preferredPartner}
                  onChange={(e) => setPreferredPartner(e.target.value)}
                  placeholder="e.g., John Doe, Sarah Smith"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you know someone in the program you'd like to be paired
                  with, mention their name(s) here
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-[#E0F2CC] rounded-lg border border-[#A6FF48]">
                <h3 className="font-semibold text-[#053D3D] mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Your request will be reviewed by an admin</li>
                  <li>
                    ✓ You'll receive an email notification with the decision
                  </li>
                  <li>
                    ✓ If approved, you'll be matched with a new partner within 1
                    week
                  </li>
                  <li>✓ Your current match will remain active until then</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || reason.trim().length < 10}
                  className="flex-1 bg-[#053D3D] hover:bg-[#0a5555] text-white font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Link href="/member">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
