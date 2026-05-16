"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutGrid, FileText, Users, BarChart3, Settings,
  Plug, Home, Plus, LogOut, Zap, Moon, Sun, ArrowRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  group: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  workspaceSlug?: string;
  workspaceName?: string;
}

export function CommandPalette({ workspaceSlug, workspaceName }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  const commands: Command[] = [
    ...(workspaceSlug
      ? [
          {
            id: "board",
            label: "Board",
            description: `${workspaceName} · Kanban board`,
            icon: LayoutGrid,
            action: () => navigate(`/workspace/${workspaceSlug}`),
            group: "Navigate",
            keywords: ["kanban", "tasks", "board"],
          },
          {
            id: "docs",
            label: "Docs",
            description: `${workspaceName} · Documentation`,
            icon: FileText,
            action: () => navigate(`/workspace/${workspaceSlug}/docs`),
            group: "Navigate",
            keywords: ["documents", "wiki", "notes"],
          },
          {
            id: "members",
            label: "Members",
            description: `${workspaceName} · Team members`,
            icon: Users,
            action: () => navigate(`/workspace/${workspaceSlug}/members`),
            group: "Navigate",
            keywords: ["team", "people", "invite"],
          },
          {
            id: "analytics",
            label: "Analytics",
            description: `${workspaceName} · Charts & insights`,
            icon: BarChart3,
            action: () => navigate(`/workspace/${workspaceSlug}/analytics`),
            group: "Navigate",
            keywords: ["charts", "stats", "metrics", "graphs"],
          },
          {
            id: "integrations",
            label: "Integrations",
            description: `${workspaceName} · Slack, GitHub, Discord`,
            icon: Plug,
            action: () => navigate(`/workspace/${workspaceSlug}/integrations`),
            group: "Navigate",
            keywords: ["slack", "github", "discord", "connect"],
          },
          {
            id: "settings",
            label: "Settings",
            description: `${workspaceName} · Workspace settings`,
            icon: Settings,
            action: () => navigate(`/workspace/${workspaceSlug}/settings`),
            group: "Navigate",
            keywords: ["config", "preferences", "workspace"],
          },
        ]
      : []),
    {
      id: "dashboard",
      label: "Dashboard",
      description: "All workspaces",
      icon: Home,
      action: () => navigate("/dashboard"),
      group: "Navigate",
      keywords: ["home", "workspaces"],
    },
    {
      id: "new-workspace",
      label: "New Workspace",
      description: "Create a new workspace",
      icon: Plus,
      action: () => navigate("/dashboard?new=1"),
      group: "Actions",
      keywords: ["create", "workspace", "new"],
    },
    {
      id: "upgrade",
      label: "Upgrade to Pro",
      description: "Unlock unlimited members & AI",
      icon: Zap,
      action: () => navigate("/billing"),
      group: "Actions",
      keywords: ["billing", "pro", "plan", "subscribe"],
    },
    {
      id: "signout",
      label: "Sign out",
      description: "Log out of WorkspaceFlow",
      icon: LogOut,
      action: () => {
        setOpen(false);
        signOut({ callbackUrl: "/login" });
      },
      group: "Account",
      keywords: ["logout", "leave", "exit"],
    },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatFiltered[selected]?.action();
    }
  }

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search commands, pages, actions..."
            className="flex-1 bg-transparent text-white placeholder:text-white/25 text-sm outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/25 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/25 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([group, cmds]) => (
              <div key={group}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">{group}</p>
                </div>
                {cmds.map((cmd) => {
                  const idx = flatIndex++;
                  const isSelected = idx === selected;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelected(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isSelected ? "bg-[#ff5c00]/15" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-[#ff5c00]/20" : "bg-white/5"
                      )}>
                        <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-[#ff5c00]" : "text-white/40")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", isSelected ? "text-white" : "text-white/70")}>
                          {cmd.label}
                        </p>
                        {cmd.description && (
                          <p className="text-xs text-white/30 truncate">{cmd.description}</p>
                        )}
                      </div>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#ff5c00] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-2 flex items-center gap-4 text-[10px] text-white/20">
          <span className="flex items-center gap-1.5">
            <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
            Toggle
          </span>
        </div>
      </div>
    </div>
  );
}
