"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  GitBranch, MessageSquare, Zap, CheckCircle2, XCircle,
  ExternalLink, RefreshCw, Trash2, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface Integration {
  id: string;
  type: "SLACK" | "GITHUB" | "DISCORD";
  enabled: boolean;
  accessToken: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationConfig {
  type: "SLACK" | "GITHUB" | "DISCORD";
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
  docsUrl: string;
  features: string[];
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    type: "SLACK",
    name: "Slack",
    description: "Send task updates, comments, and workspace activity to your Slack channels in real time.",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
    color: "text-[#4A154B]",
    bgColor: "bg-[#4A154B]/10",
    borderColor: "border-[#4A154B]/30",
    docsUrl: "https://api.slack.com/authentication/token-types",
    fields: [
      { key: "accessToken", label: "Bot Token", placeholder: "xoxb-...", secret: true },
      { key: "channel", label: "Default Channel", placeholder: "#general" },
    ],
    features: ["Task created/updated notifications", "Comment alerts", "Daily digest", "Status changes"],
  },
  {
    type: "GITHUB",
    name: "GitHub",
    description: "Link pull requests to tasks, track commits, and sync issues between GitHub and WorkspaceFlow.",
    icon: GitBranch,
    color: "text-white",
    bgColor: "bg-white/10",
    borderColor: "border-white/20",
    docsUrl: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token",
    fields: [
      { key: "accessToken", label: "Personal Access Token", placeholder: "ghp_...", secret: true },
      { key: "repo", label: "Repository (owner/repo)", placeholder: "org/repo-name" },
    ],
    features: ["PR ↔ task linking", "Commit references", "Issue sync", "Code review alerts"],
  },
  {
    type: "DISCORD",
    name: "Discord",
    description: "Post workspace activity, task updates, and team notifications to your Discord server.",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.13 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    color: "text-[#5865F2]",
    bgColor: "bg-[#5865F2]/10",
    borderColor: "border-[#5865F2]/30",
    docsUrl: "https://discord.com/developers/docs/topics/oauth2",
    fields: [
      { key: "accessToken", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/...", secret: true },
      { key: "serverId", label: "Server Name", placeholder: "My Team Server" },
    ],
    features: ["Activity feed", "Task assignment DMs", "Sprint summary", "Team mentions"],
  },
];

function IntegrationCard({
  config,
  integration,
  workspaceId,
  onUpdate,
}: {
  config: IntegrationConfig;
  integration: Integration | null;
  workspaceId: string;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isConnected = !!integration?.accessToken || !!integration;

  async function handleSave() {
    setSaving(true);
    try {
      const metadata: Record<string, string> = {};
      config.fields.forEach((f) => {
        if (f.key !== "accessToken" && fields[f.key]) {
          metadata[f.key] = fields[f.key];
        }
      });

      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: config.type,
          accessToken: fields["accessToken"] || integration?.accessToken || null,
          metadata: Object.keys(metadata).length ? metadata : null,
          enabled: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      toast.success(`${config.name} connected successfully`);
      setOpen(false);
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(enabled: boolean) {
    setToggling(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: config.type, enabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${config.name} ${enabled ? "enabled" : "disabled"}`);
      onUpdate();
    } catch {
      toast.error("Failed to update integration");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: config.type }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success(`${config.name} disconnected`);
      onUpdate();
    } catch {
      toast.error("Failed to remove integration");
    } finally {
      setDeleting(false);
    }
  }

  const Icon = config.icon;

  return (
    <>
      <div className={`relative rounded-2xl border bg-[#0d0d14] p-6 flex flex-col gap-5 transition-all hover:border-white/10 ${isConnected ? "border-white/10" : "border-white/5"}`}>
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          {isConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs px-2.5 py-0.5">
              <CheckCircle2 className="w-3 h-3 mr-1.5 inline" />
              {integration?.enabled ? "Active" : "Disabled"}
            </Badge>
          ) : (
            <Badge className="bg-white/5 text-white/30 border border-white/10 text-xs px-2.5 py-0.5">
              <XCircle className="w-3 h-3 mr-1.5 inline" />
              Not connected
            </Badge>
          )}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.borderColor} border flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{config.name}</h3>
            <p className="text-white/40 text-sm mt-0.5 leading-relaxed pr-20">{config.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-1.5">
          {config.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-1 h-1 rounded-full bg-[#2dd4bf]/60 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {isConnected ? (
            <>
              <Switch
                checked={integration?.enabled ?? true}
                onCheckedChange={handleToggle}
                disabled={toggling}
              />
              <span className="text-xs text-white/40">
                {integration?.enabled ? "Enabled" : "Paused"}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className="text-xs h-7 px-2.5"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Reconfigure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  loading={deleting}
                  className="text-xs h-7 px-2.5 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setOpen(true)}
              className="text-xs"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Connect {config.name}
            </Button>
          )}
        </div>
      </div>

      {/* Configure dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-[#0d0d14] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className={`w-8 h-8 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              Configure {config.name}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Enter your {config.name} credentials to enable the integration.{" "}
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2dd4bf] hover:text-[#5eead4] inline-flex items-center gap-1"
              >
                View docs <ExternalLink className="w-3 h-3" />
              </a>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-white/70 text-sm">{field.label}</Label>
                <div className="relative">
                  <Input
                    type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={fields[field.key] ?? ""}
                    onChange={(e) => setFields((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pr-10"
                  />
                  {field.secret && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets((p) => ({ ...p, [field.key]: !p[field.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showSecrets[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-white/10">
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleSave} loading={saving}>
                Save Integration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function IntegrationsPage() {
  const params = useParams<{ slug: string }>();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const wsRes = await fetch(`/api/workspaces/slug/${params.slug}`);
      if (!wsRes.ok) return;
      const ws = await wsRes.json();
      setWorkspaceId(ws.id);

      const intRes = await fetch(`/api/workspaces/${ws.id}/integrations`);
      if (intRes.ok) {
        const data = await intRes.json();
        setIntegrations(data);
      }
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-white/40 mt-1 text-sm">
            Connect your workspace to third-party tools. Only workspace owners can manage integrations.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Connected", value: integrations.filter((i) => !!i).length, color: "text-emerald-400" },
            { label: "Active", value: integrations.filter((i) => i.enabled).length, color: "text-[#2dd4bf]" },
            { label: "Available", value: INTEGRATIONS.length, color: "text-white/60" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-white/30 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Integration cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {INTEGRATIONS.map((config) => {
            const integration = integrations.find((i) => i.type === config.type) ?? null;
            return (
              <IntegrationCard
                key={config.type}
                config={config}
                integration={integration}
                workspaceId={workspaceId ?? ""}
                onUpdate={fetchData}
              />
            );
          })}
        </div>

        {/* Security notice */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber-400 text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-amber-400/90 text-sm font-medium">Security notice</p>
            <p className="text-amber-400/50 text-xs mt-1 leading-relaxed">
              Access tokens are stored encrypted and never exposed in API responses. Only owners can view or modify integration settings. Revoke tokens from the provider dashboard if you suspect compromise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
