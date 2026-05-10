"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users,
  Loader2,
  Crown,
  ShieldCheck,
  User,
  Mail,
  Trash2,
  Clock,
  Send,
  AlertCircle,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials, formatDate } from "@/lib/utils";
import type { Workspace, WorkspaceMember, MemberRole } from "@/types";

interface PendingInvite {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
  expiresAt: string | null;
}

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "warning" | "success" | "destructive" | "outline" | "purple" }> = {
  OWNER: { label: "Owner", icon: Crown, variant: "default" },
  MEMBER: { label: "Member", icon: ShieldCheck, variant: "secondary" },
  GUEST: { label: "Guest", icon: User, variant: "outline" },
};

export default function MembersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();

  const [workspace, setWorkspace] = useState<(Workspace & { role?: string }) | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("MEMBER");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Remove member
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<WorkspaceMember | null>(null);

  // Load workspace
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workspaces/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ws: (Workspace & { role?: string }) | null) => {
        if (ws) setWorkspace(ws);
      })
      .finally(() => setLoadingWorkspace(false));
  }, [slug]);

  const loadMembers = useCallback(async () => {
    if (!workspace?.id) return;
    setLoadingMembers(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/workspaces/${workspace.id}/members`),
        fetch(`/api/workspaces/${workspace.id}/invite`),
      ]);
      if (membersRes.ok) setMembers(await membersRes.json());
      if (invitesRes.ok) setPendingInvites(await invitesRes.json());
    } finally {
      setLoadingMembers(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const isOwner = workspace?.role === "OWNER" || workspace?.ownerId === session?.user?.id;

  const handleRoleChange = async (member: WorkspaceMember, role: MemberRole) => {
    if (!workspace?.id || member.role === "OWNER") return;
    try {
      const res = await fetch(
        `/api/workspaces/${workspace.id}/members/${member.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, role } : m))
        );
      }
    } catch {}
  };

  const handleRemoveMember = async (member: WorkspaceMember) => {
    if (!workspace?.id) return;
    setRemovingMemberId(member.id);
    try {
      const res = await fetch(
        `/api/workspaces/${workspace.id}/members/${member.userId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        setConfirmRemove(null);
      }
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !workspace?.id || sendingInvite) return;
    setSendingInvite(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.ok) {
        const invite = await res.json();
        setPendingInvites((prev) => [invite, ...prev]);
        setInviteEmail("");
        setInviteRole("MEMBER");
        setInviteSuccess(true);
        setTimeout(() => setInviteSuccess(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error ?? "Failed to send invite");
      }
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <>
    <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#1e1e2e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0d9488]/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2dd4bf]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Members</h1>
              <p className="text-sm text-white/40 mt-0.5">
                {members.length} member{members.length !== 1 ? "s" : ""} in this workspace
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-8 py-6 max-w-4xl space-y-8">
            {/* Members list */}
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                Workspace Members
              </h2>
              <div className="rounded-2xl border border-[#1e1e2e] overflow-hidden">
                {loadingMembers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-[#2dd4bf]/60" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12 text-white/30">No members found</div>
                ) : (
                  members.map((member, idx) => {
                    const roleCfg = ROLE_CONFIG[member.role];
                    const RoleIcon = roleCfg.icon;
                    const isSelf = member.userId === session?.user?.id;
                    const canModify = isOwner && !isSelf && member.role !== "OWNER";

                    return (
                      <div key={member.id}>
                        {idx > 0 && <Separator />}
                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={member.user.image ?? ""} />
                            <AvatarFallback>
                              {getInitials(member.user.name ?? member.user.email)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {member.user.name ?? member.user.email}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] text-[#2dd4bf]/70 bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/40 truncate mt-0.5">
                              {member.user.email}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-white/30 shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>Joined {formatDate(member.joinedAt)}</span>
                          </div>

                          {canModify ? (
                            <Select
                              value={member.role}
                              onValueChange={(v) => handleRoleChange(member, v as MemberRole)}
                            >
                              <SelectTrigger className="w-28 h-7 text-xs px-2">
                                <div className="flex items-center gap-1.5">
                                  <RoleIcon className="w-3 h-3" />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MEMBER">
                                  <span className="flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Member
                                  </span>
                                </SelectItem>
                                <SelectItem value="GUEST">
                                  <span className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Guest
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={roleCfg.variant} className="shrink-0">
                              <RoleIcon className="w-3 h-3" />
                              {roleCfg.label}
                            </Badge>
                          )}

                          {canModify && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-white/30 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                              onClick={() => setConfirmRemove(member)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Invite section */}
            {isOwner && (
              <div>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                  Invite Member
                </h2>
                <div className="rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] p-6">
                  <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        required
                        className={cn(
                          "w-full h-9 pl-9 pr-3 rounded-lg border bg-[#111118] text-sm text-white placeholder:text-white/25",
                          "focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf]/50 transition-all",
                          inviteError ? "border-red-500/50" : "border-[#2a2a3e]"
                        )}
                      />
                    </div>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                      <SelectTrigger className="w-32 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="GUEST">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" loading={sendingInvite} className="h-9 gap-2 shrink-0">
                      <Send className="w-3.5 h-3.5" />
                      Send Invite
                    </Button>
                  </form>

                  {inviteError && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {inviteError}
                    </div>
                  )}
                  {inviteSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Invitation sent successfully
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending invites */}
            {pendingInvites.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                  Pending Invites
                </h2>
                <div className="rounded-2xl border border-[#1e1e2e] overflow-hidden">
                  {pendingInvites.map((invite, idx) => (
                    <div key={invite.id}>
                      {idx > 0 && <Separator />}
                      <div className="flex items-center gap-4 px-5 py-3.5">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5 text-white/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/70 truncate">{invite.email}</p>
                          {invite.expiresAt && (
                            <p className="text-xs text-white/25 mt-0.5">
                              Expires {formatDate(invite.expiresAt)}
                            </p>
                          )}
                        </div>
                        <Badge variant="warning" className="shrink-0 text-xs">
                          Pending
                        </Badge>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {invite.role.charAt(0) + invite.role.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Confirm remove dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle>Remove Member</DialogTitle>
            </div>
            <DialogDescription>
              Remove <span className="font-medium text-white/80">
                {confirmRemove?.user.name ?? confirmRemove?.user.email}
              </span> from this workspace? They will lose access to all workspace data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={removingMemberId === confirmRemove?.id}
              onClick={() => confirmRemove && handleRemoveMember(confirmRemove)}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
