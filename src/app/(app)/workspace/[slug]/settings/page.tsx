"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Settings,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

const WORKSPACE_COLORS = [
  { value: "#ff5c00", label: "Indigo" },
  { value: "#ff5c00", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Orange" },
  { value: "#ff5c00", label: "Purple" },
];

export default function SettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [workspace, setWorkspace] = useState<(Workspace & { role?: string }) | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ff5c00");
  const [customColor, setCustomColor] = useState("#ff5c00");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load workspace
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workspaces/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ws: (Workspace & { role?: string }) | null) => {
        if (ws) {
          setWorkspace(ws);
          setName(ws.name);
          setDescription(ws.description ?? "");
          setSelectedColor(ws.color);
          setCustomColor(ws.color);
        }
      })
      .finally(() => setLoadingWorkspace(false));
  }, [slug]);

  const isOwner = workspace?.role === "OWNER" || workspace?.ownerId === session?.user?.id;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || saving) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color: selectedColor,
        }),
      });
      if (res.ok) {
        const updated: Workspace = await res.json();
        setWorkspace((prev) => ({ ...prev!, ...updated }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "Failed to save changes");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace?.id || deleting) return;
    if (deleteConfirmText !== workspace.name) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "Failed to delete workspace");
        setDeleting(false);
      }
    } catch {
      setDeleteError("Failed to delete workspace");
      setDeleting(false);
    }
  };

  const activeColor = selectedColor;

  return (
    <>
    <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#1e1e2e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cc3d00]/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#ff5c00]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Settings</h1>
              <p className="text-sm text-white/40 mt-0.5">Manage workspace preferences</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-8 py-6 max-w-2xl space-y-8">
            {/* General settings */}
            <form onSubmit={handleSave}>
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1e1e2e]">
                  <h2 className="text-sm font-semibold text-white">General</h2>
                  <p className="text-xs text-white/40 mt-0.5">Basic workspace information</p>
                </div>
                <div className="px-6 py-5 space-y-5">
                  {/* Workspace preview */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 transition-all duration-200"
                      style={{ background: activeColor }}
                    >
                      {name[0]?.toUpperCase() ?? "W"}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{name || "Workspace Name"}</p>
                      <p className="text-xs text-white/40 mt-0.5">{description || "No description"}</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Workspace Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Workspace"
                      required
                      disabled={!isOwner}
                      className={cn(
                        "w-full h-9 px-3 rounded-lg border border-[#2a2a3e] bg-[#0d0d14] text-sm text-white placeholder:text-white/25",
                        "focus:outline-none focus:ring-2 focus:ring-[#ff5c00]/50 focus:border-[#ff5c00]/50 transition-all",
                        !isOwner && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this workspace for?"
                      rows={3}
                      disabled={!isOwner}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-lg border border-[#2a2a3e] bg-[#0d0d14] text-sm text-white placeholder:text-white/25 resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-[#ff5c00]/50 focus:border-[#ff5c00]/50 transition-all",
                        !isOwner && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-2.5">
                      <Palette className="w-3.5 h-3.5" />
                      Accent Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {WORKSPACE_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => { setSelectedColor(c.value); setCustomColor(c.value); }}
                          disabled={!isOwner}
                          title={c.label}
                          className={cn(
                            "w-8 h-8 rounded-lg transition-all duration-150 shrink-0 relative",
                            !isOwner && "cursor-not-allowed opacity-50"
                          )}
                          style={{ background: c.value }}
                        >
                          {selectedColor === c.value && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                            </span>
                          )}
                          <span
                            className={cn(
                              "absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-offset-[#111118] transition-all",
                              selectedColor === c.value ? "ring-white/50" : "ring-transparent"
                            )}
                          />
                        </button>
                      ))}
                      {/* Custom color */}
                      <label
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 border-dashed border-[#3a3a52] hover:border-white/30 flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden",
                          !isOwner && "cursor-not-allowed opacity-50"
                        )}
                        title="Custom color"
                      >
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => { setCustomColor(e.target.value); setSelectedColor(e.target.value); }}
                          disabled={!isOwner}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Palette className="w-3.5 h-3.5 text-white/30" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                {isOwner && (
                  <div className="px-6 py-4 border-t border-[#1e1e2e] bg-[#0d0d14] flex items-center justify-between">
                    <div>
                      {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Changes saved
                        </span>
                      )}
                      {saveError && (
                        <span className="text-sm text-red-400">{saveError}</span>
                      )}
                    </div>
                    <Button type="submit" loading={saving} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </form>

            {/* Danger zone */}
            {isOwner && (
              <div className="rounded-2xl border border-red-500/20 bg-[#111118] overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">
                    These actions are permanent and cannot be undone
                  </p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">Delete Workspace</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Permanently delete this workspace, all tasks, docs, and member data.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => { setDeleteConfirmText(""); setShowDeleteDialog(true); }}
                      className="shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isOwner && (
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] p-5 text-center">
                <p className="text-sm text-white/40">
                  Only the workspace owner can modify settings.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(o) => !o && setShowDeleteDialog(false)}>
        <DialogContent size="sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle>Delete Workspace</DialogTitle>
            </div>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-white">{workspace?.name}</span> and all its
              data. This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4">
            <label className="block text-xs text-white/50 mb-2">
              Type <span className="font-mono text-white/80 bg-white/5 px-1.5 py-0.5 rounded">{workspace?.name}</span> to confirm
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={workspace?.name}
              className="w-full h-9 px-3 rounded-lg border border-[#2a2a3e] bg-[#0d0d14] text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />
            {deleteError && (
              <p className="mt-2 text-xs text-red-400">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleting}
              disabled={deleteConfirmText !== workspace?.name}
              onClick={handleDelete}
            >
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
