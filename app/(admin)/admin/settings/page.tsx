"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  User,
  Mail,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "platform" | "export">(
    "profile"
  );

  const tabs = [
    { id: "profile" as const, label: "Admin Profile", icon: User },
    { id: "platform" as const, label: "Platform Settings", icon: Settings },
    { id: "export" as const, label: "Export & Reports", icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Configure your GatherUp platform settings
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
      {activeTab === "profile" && <AdminProfileTab />}
      {activeTab === "platform" && <PlatformSettingsTab />}
      {activeTab === "export" && <ExportReportsTab />}
    </div>
  );
}

function AdminProfileTab() {
  const { data: admin } = useSWR("/api/admin", fetcher);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load admin data when available
  if (admin && !name && !email) {
    setName(admin.name || "");
    setEmail(admin.email || "");
  }

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      alert("Please fill in name and email");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        mutate("/api/admin");
      } else {
        alert("Failed to update profile");
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
      const response = await fetch("/api/admin/password", {
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
              placeholder="admin@gatherup.com"
            />
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

function PlatformSettingsTab() {
  const [platformName, setPlatformName] = useState("GatherUp");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome to your accountability platform"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save (no backend yet - future feature)
    setTimeout(() => {
      alert("Settings saved! (Note: This is a preview feature)");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              <strong>Note:</strong> Advanced platform customization (branding,
              white-labeling) is available in the multi-tenancy upgrade. These
              are basic settings for the current platform.
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Platform Name</Label>
            <Input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="GatherUp"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed in emails and dashboard
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Welcome Message</Label>
            <Input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Welcome message for new members"
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown to members on their dashboard
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Member Defaults
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">
                  Require members to complete onboarding before accessing
                  dashboard
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">
                  Send welcome email after member accepts invitation
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">
                  Notify admin when new member completes onboarding
                </span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportReportsTab() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: stats } = useSWR("/api/admin/dashboard", fetcher);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      window.open("/api/admin/export-members", "_blank");
      setTimeout(() => setIsExporting(false), 1000);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Export Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#053D3D]" />
            Data Export & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Download your platform data for offline analysis, reporting, and
            record-keeping. All exports are in CSV format and include complete
            member information.
          </p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              What's Included in Exports
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Member names, emails, and contact preferences</li>
              <li>• Goal categories, goal text, and progress scores</li>
              <li>• Match status and activity timestamps</li>
              <li>• Onboarding preferences and commitment levels</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-[#A6FF48]">
        <CardHeader>
          <CardTitle>Member Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#053D3D]">
                {stats?.totalMembers || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                Total Members
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#053D3D]">
                {stats?.activeMatches || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                Active Matches
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-gray-900 text-sm">
              Export Format
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>CSV format compatible with Excel, Google Sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Includes all members (pending + active)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Properly escaped and formatted data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Timestamp-based filename for version tracking</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white h-12 text-base"
          >
            {isExporting ? (
              <>
                <Settings className="w-5 h-5 mr-2 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                Download Members CSV
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            File will download as: gatherup-members-YYYY-MM-DD.csv
          </p>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">Reporting:</strong> Use exported
              data to create custom reports, charts, and analytics in your
              preferred spreadsheet tool.
            </div>
            <div>
              <strong className="text-gray-900">Backup:</strong> Regular exports
              serve as offline backups of your member database for compliance
              and record-keeping.
            </div>
            <div>
              <strong className="text-gray-900">Analysis:</strong> Import into
              BI tools like Tableau, Power BI, or Google Data Studio for
              advanced insights.
            </div>
            <div>
              <strong className="text-gray-900">Privacy:</strong> Exported files
              contain personal information. Store securely and comply with data
              protection regulations.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
