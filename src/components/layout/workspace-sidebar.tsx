"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutGrid, FileText, Users, BarChart3, Settings, LogOut,
  ChevronDown, Plus, CreditCard, Home, Zap, Plug, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { Workspace } from "@/types";

interface WorkspaceSidebarProps {
  workspace: Workspace & { role?: string };
  allWorkspaces?: (Workspace & { role?: string })[];
}

const navItems = [
  { href: "", label: "Board", icon: LayoutGrid },
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/members", label: "Members", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function WorkspaceSidebar({ workspace, allWorkspaces = [] }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const base = `/workspace/${workspace.slug}`;

  return (
    <aside className="flex flex-col w-60 min-w-60 h-screen bg-[#0d0d14] border-r border-[#1e1e2e] sticky top-0">
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-[#1e1e2e]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a1a26] transition-colors group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: workspace.color }}
              >
                {workspace.icon ?? workspace.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">{workspace.name}</p>
                <p className="text-xs text-white/40 capitalize">{workspace.role?.toLowerCase() ?? "member"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {allWorkspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} asChild>
                <Link href={`/workspace/${ws.slug}`} className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: ws.color }}
                  >
                    {ws.icon ?? ws.name[0].toUpperCase()}
                  </div>
                  <span className="truncate">{ws.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <Home className="w-4 h-4" />
                All Workspaces
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard?new=1" className="flex items-center gap-2.5 text-indigo-400">
                <Plus className="w-4 h-4" />
                New Workspace
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search / Command palette trigger */}
      <div className="px-3 pt-2 pb-1">
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 text-white/30 hover:text-white/50 transition-all text-sm group"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search...</span>
          <kbd className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-1.5 py-0.5 group-hover:bg-white/10 transition-colors">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = href === ""
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(fullHref);
          return (
            <Link
              key={label}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                  : "text-white/50 hover:bg-[#1a1a26] hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-indigo-400")} />
              {label}
            </Link>
          );
        })}

        <div className="pt-2 pb-1">
          <p className="px-3 text-xs font-medium text-white/20 uppercase tracking-wider">Workspace</p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-[#1a1a26] hover:text-white transition-all"
        >
          <Home className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        <Link
          href="/billing"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            workspace.subscription?.tier === "FREE"
              ? "text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-400"
              : "text-white/50 hover:bg-[#1a1a26] hover:text-white"
          )}
        >
          {workspace.subscription?.tier === "FREE" ? (
            <Zap className="w-4 h-4 shrink-0" />
          ) : (
            <CreditCard className="w-4 h-4 shrink-0" />
          )}
          {workspace.subscription?.tier === "FREE" ? "Upgrade to Pro" : "Billing"}
        </Link>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-[#1e1e2e]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a1a26] transition-colors">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(session?.user?.name ?? session?.user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-xs text-white/40 truncate">{session?.user?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <Home className="w-4 h-4" /> Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-2.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
