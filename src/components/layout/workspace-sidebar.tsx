"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutGrid, FileText, Users, BarChart3, Settings, LogOut,
  ChevronDown, Plus, CreditCard, Home, Zap, Plug, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2" fill="#2dd4bf" />
      <rect x="16" y="2" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.5" />
      <rect x="2" y="16" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.5" />
      <rect x="16" y="16" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.25" />
    </svg>
  );
}

export function WorkspaceSidebar({ workspace, allWorkspaces = [] }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const base = `/workspace/${workspace.slug}`;

  return (
    <aside
      className="flex flex-col w-[220px] min-w-[220px] h-screen sticky top-0"
      style={{ background: "#09090f", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2 px-4 h-12 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Logo />
        <span className="font-bold text-white text-[13px]" style={{ letterSpacing: "-0.02em" }}>
          WorkspaceFlow
        </span>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors group"
              style={{ background: "rgba(255,255,255,0.03)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ background: workspace.color }}
              >
                {workspace.icon ?? workspace.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                  {workspace.name}
                </p>
                <p className="text-[10px] capitalize" style={{ color: "rgba(240,240,248,0.35)" }}>
                  {workspace.role?.toLowerCase() ?? "member"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(240,240,248,0.3)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="start">
            {allWorkspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} asChild>
                <Link href={`/workspace/${ws.slug}`} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
                    style={{ background: ws.color }}
                  >
                    {ws.icon ?? ws.name[0].toUpperCase()}
                  </div>
                  <span className="truncate text-[13px]">{ws.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2.5 text-[13px]">
                <Home className="w-3.5 h-3.5" /> All Workspaces
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard?new=1" className="flex items-center gap-2.5 text-[13px]" style={{ color: "#2dd4bf" }}>
                <Plus className="w-3.5 h-3.5" /> New Workspace
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search trigger */}
      <div className="px-3 pt-1 pb-3 shrink-0">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-[12px]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(240,240,248,0.3)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(240,240,248,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            (e.currentTarget as HTMLElement).style.color = "rgba(240,240,248,0.3)";
          }}
        >
          <Search className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,240,248,0.22)" }}>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Section label */}
      <div className="px-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(240,240,248,0.2)" }}>
          Workspace
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
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
                "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-100",
                !isActive && "hover:text-white"
              )}
              style={
                isActive
                  ? { background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.13)", color: "#2dd4bf" }
                  : { color: "rgba(240,240,248,0.45)" }
              }
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? "#2dd4bf" : undefined }} />
              {label}
            </Link>
          );
        })}

        <div className="pt-3 pb-1">
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(240,240,248,0.18)" }}>
            Account
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-100"
          style={{ color: "rgba(240,240,248,0.45)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#f0f0f8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(240,240,248,0.45)"; }}
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          Dashboard
        </Link>

        <Link
          href="/billing"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-100"
          style={{ color: workspace.subscription?.tier === "FREE" ? "#2dd4bf" : "rgba(240,240,248,0.45)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = workspace.subscription?.tier === "FREE" ? "rgba(45,212,191,0.06)" : "rgba(255,255,255,0.04)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          {workspace.subscription?.tier === "FREE" ? <Zap className="w-3.5 h-3.5 shrink-0" /> : <CreditCard className="w-3.5 h-3.5 shrink-0" />}
          {workspace.subscription?.tier === "FREE" ? "Upgrade to Pro" : "Billing"}
        </Link>
      </nav>

      {/* User footer */}
      <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-[10px] font-semibold" style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf" }}>
                  {getInitials(session?.user?.name ?? session?.user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-semibold text-white truncate">{session?.user?.name ?? "User"}</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(240,240,248,0.35)" }}>{session?.user?.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2.5 text-[13px]">
                <Home className="w-3.5 h-3.5" /> Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 text-[13px]"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
