"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Send,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<
    "send" | "templates" | "logs" | "schedule"
  >("send");

  const tabs = [
    { id: "send" as const, label: "Send Email", icon: Send },
    { id: "templates" as const, label: "Templates", icon: FileText },
    { id: "logs" as const, label: "Email Logs", icon: Mail },
    { id: "schedule" as const, label: "Schedule", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Communications
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Manage email templates, send messages, and view email history
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
      {activeTab === "send" && <SendEmailTab />}
      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "logs" && <EmailLogsTab />}
      {activeTab === "schedule" && <ScheduleTab />}
    </div>
  );
}

function SendEmailTab() {
  const { data: members } = useSWR("/api/members", fetcher);
  const { data: templates } = useSWR("/api/email-templates", fetcher);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipientType, setRecipientType] = useState<
    "all" | "matched" | "unmatched" | "specific"
  >("all");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!customSubject || !customBody) {
      alert("Please fill in subject and message");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType,
          selectedMembers: recipientType === "specific" ? selectedMembers : [],
          subject: customSubject,
          bodyHtml: customBody,
          bodyText: customBody,
        }),
      });

      if (response.ok) {
        alert("Emails sent successfully!");
        setCustomSubject("");
        setCustomBody("");
        setSelectedMembers([]);
        mutate("/api/emails/logs");
      } else {
        const error = await response.json();
        alert(`Failed to send emails: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates?.find((t: any) => t.id === parseInt(templateId));
    if (template) {
      setCustomSubject(template.subject);
      setCustomBody(template.bodyHtml);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selector */}
            {templates && (
              <div>
                <Label>Load Template (Optional)</Label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    if (e.target.value) loadTemplate(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2"
                >
                  <option value="">Custom Email</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div>
              <Label>Subject</Label>
              <div className="mt-2">
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <Label>Message</Label>
              <Textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Enter email message (supports HTML)"
                rows={12}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{{memberName}}"}, {"{{goal}}"},
                {"{{partnerName}}"}
              </p>
            </div>

            <Button
              onClick={handleSend}
              disabled={isSending}
              className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="order-1 lg:order-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Send To</Label>
              <select
                value={recipientType}
                onChange={(e) =>
                  setRecipientType(
                    e.target.value as
                      | "all"
                      | "matched"
                      | "unmatched"
                      | "specific"
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2"
              >
                <option value="all">All Members</option>
                <option value="matched">Matched Members Only</option>
                <option value="unmatched">Unmatched Members Only</option>
                <option value="specific">Specific Members</option>
              </select>
            </div>

            {recipientType === "specific" && members && (
              <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-2">
                {members.map((item: any) => (
                  <label
                    key={item.member.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(item.member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([
                            ...selectedMembers,
                            item.member.id,
                          ]);
                        } else {
                          setSelectedMembers(
                            selectedMembers.filter(
                              (id) => id !== item.member.id
                            )
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{item.member.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {recipientType === "all" && (
                  <>
                    <Users className="w-4 h-4 inline mr-1" />
                    Sending to all members
                  </>
                )}
                {recipientType === "matched" && (
                  <>
                    <Users className="w-4 h-4 inline mr-1" />
                    Sending to matched members
                  </>
                )}
                {recipientType === "unmatched" && (
                  <>
                    <Users className="w-4 h-4 inline mr-1" />
                    Sending to unmatched members
                  </>
                )}
                {recipientType === "specific" && (
                  <>
                    <Users className="w-4 h-4 inline mr-1" />
                    {selectedMembers.length} member(s) selected
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TemplatesTab() {
  const {
    data: templates,
    error,
    isLoading,
  } = useSWR("/api/email-templates", fetcher);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading)
    return <div className="text-center py-8">Loading templates...</div>;
  if (error)
    return <div className="text-red-600">Failed to load templates</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-sm sm:text-base text-gray-600">
          {templates?.length || 0} email templates
        </p>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#053D3D] hover:bg-[#0a5555] text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {editingTemplate || isCreating ? (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => {
            setEditingTemplate(null);
            setIsCreating(false);
            mutate("/api/email-templates");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates?.map((template: any) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className="mt-2 bg-[#E0F2CC] text-[#053D3D]">
                      {template.templateType}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-3">
                  {template.bodyText}
                </p>
                {template.variables && template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.map((v: string) => (
                      <span
                        key={v}
                        className="text-xs px-2 py-1 bg-gray-100 rounded"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateEditor({
  template,
  onClose,
}: {
  template?: any;
  onClose: () => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [templateType, setTemplateType] = useState(
    template?.templateType || "welcome"
  );
  const [subject, setSubject] = useState(template?.subject || "");
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml || "");
  const [bodyText, setBodyText] = useState(template?.bodyText || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !subject || !bodyHtml || !bodyText) {
      alert("Please fill in all fields");
      return;
    }

    setIsSaving(true);

    try {
      const url = template
        ? `/api/email-templates/${template.id}`
        : "/api/email-templates";
      const method = template ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateType,
          subject,
          bodyHtml,
          bodyText,
          variables: extractVariables(bodyHtml),
        }),
      });

      if (response.ok) {
        alert(
          template
            ? "Template updated successfully!"
            : "Template created successfully!"
        );
        onClose();
      } else {
        alert("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {template ? "Edit Template" : "Create New Template"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Template Name</Label>
          <div className="mt-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Email"
            />
          </div>
        </div>

        <div>
          <Label>Template Type</Label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2"
          >
            <option value="welcome">Welcome</option>
            <option value="match_notification">Match Notification</option>
            <option value="check_in">Check-In Reminder</option>
            <option value="reflection">Reflection Prompt</option>
            <option value="rematch">Rematch Confirmation</option>
            <option value="goal_achieved">Goal Achievement</option>
          </select>
        </div>

        <div>
          <Label>Subject</Label>
          <div className="mt-2">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>
        </div>

        <div>
          <Label>HTML Body</Label>
          <Textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="HTML version of email"
            rows={6}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Plain Text Body</Label>
          <Textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Plain text version of email"
            rows={6}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use variables: {"{{memberName}}"}, {"{{goal}}"}, {"{{partnerName}}"}
            , {"{{partnerContact}}"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-[#053D3D] hover:bg-[#0a5555] text-white"
          >
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailLogsTab() {
  const { data: logs, error, isLoading } = useSWR("/api/emails/logs", fetcher);

  if (isLoading)
    return <div className="text-center py-8">Loading email logs...</div>;
  if (error) return <div className="text-red-600">Failed to load logs</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm sm:text-base text-gray-600">
        {logs?.length || 0} emails sent
      </p>

      <div className="bg-white border rounded-lg overflow-hidden -mx-4 sm:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.recipientEmail}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.subject}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className="bg-[#E0F2CC] text-[#053D3D]">
                      {log.templateType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.status === "sent" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Sent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [reflectionEnabled, setReflectionEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Email Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Automated emails require cron job setup.
              See Sprint 4 implementation guide for Vercel Cron or external
              scheduling service setup.
            </p>
          </div>

          {/* Check-in Reminders */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Check-In Reminders
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Sent every Monday and Thursday at 9:00 AM
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Reminds members to connect with their accountability partners
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={checkInEnabled}
                onChange={(e) => setCheckInEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E0F2CC] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#053D3D]"></div>
            </label>
          </div>

          {/* Reflection Prompts */}
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Reflection Prompts
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Sent every Wednesday at 12:00 PM
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Encourages members to reflect on their weekly progress
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reflectionEnabled}
                onChange={(e) => setReflectionEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E0F2CC] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#053D3D]"></div>
            </label>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">
              Setup Instructions
            </h3>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Create cron job endpoints in your deployment platform</li>
              <li>
                Set up endpoints: <code>/api/cron/check-ins</code> and{" "}
                <code>/api/cron/reflections</code>
              </li>
              <li>Schedule Monday/Thursday 9AM and Wednesday 12PM UTC</li>
              <li>Add CRON_SECRET environment variable for security</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
