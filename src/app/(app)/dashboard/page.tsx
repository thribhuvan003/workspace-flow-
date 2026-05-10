"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Users,
  CheckSquare,
  Clock,
  LogOut,
  Settings,
  ChevronDown,
  Loader2,
  Sparkles,
  LayoutGrid,
  Home,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatRelativeTime, WORKSPACE_COLORS } from "@/lib/utils";
import type { Workspace } from "@/types";

// ─── Workspace Card ──────────────────────────────────────────────────────────

function WorkspaceCard({ workspace }: { workspace: Workspace & { role?: string } }) {
  const router = useRouter();
  const memberCount = workspace._count?.members ?? workspace.members?.length ?? 0;
  const taskCount = workspace._count?.tasks ?? 0;
  const lastActivity = formatRelativeTime(workspace.updatedAt);

  return (
    <div
      className="group relative rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#2a2a3e] hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
      onClick={() => router.push(`/workspace/${workspace.slug}`)}
    >
      {/* Color bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: workspace.color }}
      />

      {/* Subtle glow behind the color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-16 opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${workspace.color}, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg"
              style={{ background: workspace.color }}
            >
              {workspace.icon ?? workspace.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-base leading-tight truncate">
                {workspace.name}
              </h3>
              {workspace.role && (
                <span className="text-xs text-white/40 capitalize">{workspace.role.toLowerCase()}</span>
              )}
            </div>
          </div>
          {workspace.subscription?.tier === "FREE" ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1e1e2e] text-white/40 border border-[#2a2a3e]">
              <Lock className="w-2.5 h-2.5" /> Free
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ff5c00]/10 text-[#ff5c00] border border-[#ff5c00]/20">
              <Sparkles className="w-2.5 h-2.5" /> Pro
            </span>
          )}
        </div>

        {/* Description */}
        {workspace.description ? (
          <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
            {workspace.description}
          </p>
        ) : (
          <p className="text-sm text-white/25 italic mb-4">No description</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{lastActivity}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e1e2e]">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {workspace.members?.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-[#111118]">
                <AvatarImage src={member.user.image ?? ""} />
                <AvatarFallback className="text-[10px] bg-[#cc3d00]/20 text-[#ff5c00]">
                  {getInitials(member.user.name ?? member.user.email)}
                </AvatarFallback>
              </Avatar>
            ))}
            {(workspace._count?.members ?? 0) > 4 && (
              <div className="h-6 w-6 rounded-full border-2 border-[#111118] bg-[#1e1e2e] flex items-center justify-center">
                <span className="text-[9px] text-white/50">+{(workspace._count?.members ?? 0) - 4}</span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace/${workspace.slug}`);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-[#ff5c00] hover:text-[#ff8a40] transition-colors group/btn"
          >
            Open
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Workspace Card ───────────────────────────────────────────────────────

function NewWorkspaceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl border-2 border-dashed border-[#1e1e2e] bg-transparent overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#ff5c00]/40 hover:bg-[#ff5c00]/5 min-h-[200px] flex flex-col items-center justify-center gap-3 p-6"
    >
      <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[#2a2a3e] group-hover:border-[#ff5c00]/50 flex items-center justify-center transition-colors">
        <Plus className="w-5 h-5 text-white/30 group-hover:text-[#ff5c00] transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors">
          New Workspace
        </p>
        <p className="text-xs text-white/25 group-hover:text-white/40 transition-colors mt-0.5">
          Create a new project space
        </p>
      </div>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[#cc3d00]/10 border border-[#ff5c00]/20 flex items-center justify-center">
          <LayoutGrid className="w-9 h-9 text-[#ff5c00]" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#cc3d00] flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
      <p className="text-sm text-white/50 max-w-xs mb-8 leading-relaxed">
        Create your first workspace to start organizing tasks and collaborating with your team.
      </p>
      <Button variant="gradient" onClick={onCreateClick} className="gap-2">
        <Plus className="w-4 h-4" />
        Create your first workspace
      </Button>
    </div>
  );
}

// ─── Create Workspace Modal ───────────────────────────────────────────────────

const EMOJI_OPTIONS = ["🚀", "💡", "🎯", "⚡", "🔥", "🌟", "🛠️", "📦", "🎨", "🌈", "💎", "🏆"];

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (workspace: Workspace) => void;
}

function CreateWorkspaceModal({ open, onOpenChange, onCreated }: CreateWorkspaceModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(WORKSPACE_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const reset = () => {
    setName("");
    setDescription("");
    setSelectedColor(WORKSPACE_COLORS[0]);
    setSelectedEmoji(null);
    setErrors({});
    setLoading(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      if (!val) reset();
      onOpenChange(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrors({ name: "Workspace name is required" });
      return;
    }
    if (trimmed.length < 2) {
      setErrors({ name: "Name must be at least 2 characters" });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim() || undefined,
          color: selectedColor,
          icon: selectedEmoji ?? undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Failed to create workspace" });
        setLoading(false);
        return;
      }

      toast.success(`"${data.name}" created!`);
      onCreated(data);
      reset();
      onOpenChange(false);
      router.push(`/workspace/${data.slug}`);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Set up a new space for your team to collaborate and manage tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-2 space-y-5">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-200 shrink-0"
                style={{ background: selectedColor }}
              >
                {selectedEmoji ?? (name.trim() ? name.trim()[0].toUpperCase() : "W")}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {name.trim() || "Workspace name"}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {description.trim() || "No description"}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Marketing Team"
                maxLength={80}
                error={errors.name}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">
                Description <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                maxLength={300}
                rows={2}
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#111118] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff5c00]/50 focus:border-[#ff5c00]/50 resize-none transition-all"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all duration-150 focus:outline-none",
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-offset-[#111118] scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                    style={{
                      background: color,
                      boxShadow: selectedColor === color ? `0 0 0 2px #111118, 0 0 0 4px ${color}` : undefined,
                    }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Emoji */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">
                Icon <span className="text-white/30">(optional)</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedEmoji(null)}
                  className={cn(
                    "w-9 h-9 rounded-lg border text-xs font-medium transition-all",
                    selectedEmoji === null
                      ? "bg-[#cc3d00]/20 border-[#ff5c00]/40 text-[#ff5c00]"
                      : "border-[#2a2a3e] text-white/30 hover:border-[#3a3a52] hover:text-white/50"
                  )}
                >
                  A
                </button>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={cn(
                      "w-9 h-9 rounded-lg border text-lg transition-all",
                      selectedEmoji === emoji
                        ? "bg-[#cc3d00]/20 border-[#ff5c00]/40 scale-110"
                        : "border-[#2a2a3e] hover:border-[#3a3a52] hover:bg-[#1a1a26]"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {errors.general && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {errors.general}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={loading} disabled={!name.trim()}>
              {loading ? "Creating…" : "Create workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="h-1.5 w-full shimmer" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 shimmer rounded" />
            <div className="h-3 w-16 shimmer rounded" />
          </div>
        </div>
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-3/4 shimmer rounded" />
        <div className="flex gap-4 pt-1">
          <div className="h-3 w-20 shimmer rounded" />
          <div className="h-3 w-16 shimmer rounded" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#1e1e2e]">
          <div className="flex -space-x-2">
            {[1, 2].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full shimmer border-2 border-[#111118]" />
            ))}
          </div>
          <div className="h-3 w-10 shimmer rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [workspaces, setWorkspaces] = useState<(Workspace & { role?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Auto-open create modal if ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch {
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkspaces();
    }
  }, [status, fetchWorkspaces]);

  const handleCreated = (newWorkspace: Workspace) => {
    setWorkspaces((prev) => [newWorkspace, ...prev]);
  };

  const user = session?.user;
  const userInitials = getInitials(user?.name ?? user?.email ?? "U");

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff5c00] to-[#cc3d00] flex items-center justify-center shadow-lg shadow-[#ff5c00]/30">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              WorkspaceFlow
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Plus className="w-3.5 h-3.5" />
              New Workspace
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#1a1a26] transition-colors focus:outline-none">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image ?? ""} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm text-white/80 max-w-[120px] truncate">
                    {user?.name ?? user?.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="normal-case text-xs text-white/50 px-3 py-2 font-normal">
                  <p className="font-medium text-white text-sm">{user?.name ?? "User"}</p>
                  <p className="text-white/40 truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="w-4 h-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-white/40 mb-1">
              {status === "authenticated" && user?.name
                ? `Welcome back, ${user.name.split(" ")[0]}`
                : "Welcome back"}
            </p>
            <h1 className="text-2xl font-bold text-white">Your Workspaces</h1>
          </div>
          {!loading && workspaces.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Globe className="w-4 h-4" />
              <span>{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Content states */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <WorkspaceCardSkeleton key={i} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws.id} workspace={ws} />
            ))}
            <NewWorkspaceCard onClick={() => setCreateOpen(true)} />
          </div>
        )}
      </main>

      {/* Create workspace modal */}
      <CreateWorkspaceModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
