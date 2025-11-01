"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Settings,
  Shield,
  Key,
  Mail,
  MessageSquare,
  Phone,
  Users,
  Download,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MemberSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "privacy"
  >("profile");

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "preferences" as const, label: "Preferences", icon: Settings },
    { id: "privacy" as const, label: "Privacy & Data", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex overflow-x-auto space-x-2 sm:space-x-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#A6FF48] text-[#053D3D] font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "preferences" && <PreferencesTab />}
      {activeTab === "privacy" && <PrivacyTab />}
    </div>
  );
}

function ProfileTab() {
  const { data: member, mutate } = useSWR("/api/member/dashboard", fetcher);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load member data when available
  useEffect(() => {
    if (member?.member && !dataLoaded) {
      setName(member.member.name || "");
      setEmail(member.member.email || "");
      setPhoneNumber(member.member.phoneNumber || "");
      setDataLoaded(true);
    }
  }, [member, dataLoaded]);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      alert("Please fill in name and email");
      return;
    }

    if (phoneNumber && phoneNumber.trim() !== "") {
      // Check if phone number has at least 10 digits (allows formatting)
      const digitsOnly = phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        alert("Phone number must contain at least 10 digits");
        return;
      }
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/member", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        // Refresh member data to show updated phone number
        mutate();
        setDataLoaded(false); // Allow reloading updated data
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/member/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label className="mb-2 block">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label className="mb-2 block">Phone Number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 555-5555"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your phone number will be shared with your accountability partner
            </p>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label className="mb-2 block">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label className="mb-2 block">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={isUpdating}
            className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
          >
            {isUpdating ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesTab() {
  const { data: member } = useSWR("/api/member/dashboard", fetcher);
  const [isSaving, setIsSaving] = useState(false);

  const [preferredCommunication, setPreferredCommunication] = useState(
    member?.member?.preferredCommunication || "email"
  );
  const [preferredMatchType, setPreferredMatchType] = useState(
    member?.member?.preferredMatchType || "one-on-one"
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/member/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCommunication,
          preferredMatchType,
        }),
      });

      if (response.ok) {
        alert("Preferences updated successfully!");
      } else {
        alert("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Communication & Match Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Communication */}
          <div>
            <Label className="mb-3 block font-semibold">
              Preferred Communication Method
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              How would you like your accountability partner to contact you?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPreferredCommunication("email")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  preferredCommunication === "email"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Mail className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Email</p>
                  <p className="text-xs text-gray-600">Via email messages</p>
                </div>
              </button>

              <button
                onClick={() => setPreferredCommunication("text")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  preferredCommunication === "text"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Text/SMS</p>
                  <p className="text-xs text-gray-600">Text messages</p>
                </div>
              </button>

              <button
                onClick={() => setPreferredCommunication("phone")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  preferredCommunication === "phone"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Phone className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Phone Call</p>
                  <p className="text-xs text-gray-600">Voice calls</p>
                </div>
              </button>

              <button
                onClick={() => setPreferredCommunication("in-person")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  preferredCommunication === "in-person"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">In-Person</p>
                  <p className="text-xs text-gray-600">Face-to-face</p>
                </div>
              </button>
            </div>
          </div>

          {/* Preferred Match Type */}
          <div className="pt-6 border-t">
            <Label className="mb-3 block font-semibold">
              Preferred Match Type
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Would you prefer one-on-one accountability or a small group?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPreferredMatchType("one-on-one")}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  preferredMatchType === "one-on-one"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold mb-1">One-on-One</p>
                <p className="text-sm text-gray-600">
                  Paired with one accountability partner
                </p>
              </button>

              <button
                onClick={() => setPreferredMatchType("group")}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  preferredMatchType === "group"
                    ? "border-[#A6FF48] bg-[#E0F2CC]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold mb-1">Small Group</p>
                <p className="text-sm text-gray-600">
                  Part of a pod with 3-5 members
                </p>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacyTab() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      window.open("/api/member/export-data", "_blank");
      setTimeout(() => setIsExporting(false), 1000);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            Download a copy of your personal data, including your profile,
            goals, progress updates, and match information.
          </p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              What's Included
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your profile information</li>
              <li>• Current and past goals</li>
              <li>• Progress history and notes</li>
              <li>• Match information</li>
              <li>• Communication preferences</li>
            </ul>
          </div>

          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Data Sharing</h4>
            <p className="text-sm text-gray-600">
              Your information is only shared with your matched accountability
              partner(s) as necessary for the program. We never sell your data
              to third parties.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Data Retention</h4>
            <p className="text-sm text-gray-600">
              We retain your data for as long as your account is active. You can
              request deletion at any time by contacting your program
              administrator.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
            <p className="text-sm text-gray-600">
              Your password is encrypted and stored securely. We use
              industry-standard security measures to protect your data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
