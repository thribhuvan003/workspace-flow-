"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle2, Loader2, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InviteInfo {
  workspace: { name: string; color: string };
  role: string;
  invitedEmail: string;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"loading" | "valid" | "invalid" | "accepting" | "accepted" | "error">("loading");
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invite/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid invite");
        return r.json();
      })
      .then((data) => {
        setInvite(data);
        setInviteStatus("valid");
      })
      .catch(() => setInviteStatus("invalid"));
  }, [token]);

  const acceptInvite = async () => {
    setInviteStatus("accepting");
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept invite");
      const data = await res.json();
      setSlug(data.slug);
      setInviteStatus("accepted");
      setTimeout(() => router.push(`/workspace/${data.slug}`), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setInviteStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">WorkspaceFlow</span>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3e] rounded-2xl p-8">
          {inviteStatus === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-white/60">Loading invite...</p>
            </div>
          )}

          {inviteStatus === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Invalid Invite</h2>
              <p className="text-white/50 text-sm">
                This invite link is invalid or has expired.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {(inviteStatus === "valid" || inviteStatus === "accepting") && invite && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{ background: invite.workspace.color }}
                >
                  {invite.workspace.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Join <span className="text-indigo-400">{invite.workspace.name}</span>
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    You&apos;ve been invited as a{" "}
                    <span className="text-white/80 font-medium capitalize">{invite.role.toLowerCase()}</span>
                  </p>
                </div>
              </div>

              {status === "unauthenticated" ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-white/50 text-center">Sign in to accept this invite</p>
                  <Button variant="gradient" onClick={() => signIn(undefined, { callbackUrl: window.location.href })}>
                    Sign in to Accept
                  </Button>
                </div>
              ) : (
                <Button
                  variant="gradient"
                  className="w-full"
                  loading={inviteStatus === "accepting"}
                  onClick={acceptInvite}
                >
                  Accept Invite
                </Button>
              )}
            </div>
          )}

          {inviteStatus === "accepted" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">You&apos;re in!</h2>
              <p className="text-white/50 text-sm">Redirecting to workspace...</p>
            </div>
          )}

          {inviteStatus === "error" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
              <p className="text-white/50 text-sm">{error}</p>
              <Button variant="outline" onClick={() => setInviteStatus("valid")}>Try Again</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
