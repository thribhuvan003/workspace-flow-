"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  CreditCard,
  Check,
  Zap,
  Loader2,
  Crown,
  ArrowRight,
  Building2,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  LogOut,
  Home,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";
import type { Workspace } from "@/types";

const PLANS = {
  FREE: {
    name: "Free",
    price: "₹0",
    description: "Perfect for individuals and small projects",
    features: [
      "1 workspace",
      "Up to 3 members",
      "100 tasks",
      "Basic analytics",
      "Community support",
    ],
  },
  PRO: {
    name: "Pro",
    price: "₹999",
    description: "For growing teams that need more power",
    features: [
      "Unlimited workspaces",
      "Unlimited members",
      "Unlimited tasks",
      "Advanced analytics & AI insights",
      "Priority support",
      "Custom labels & workflows",
      "Slack, GitHub & Discord integrations",
    ],
  },
};

interface WorkspaceWithSub extends Workspace {
  role?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const { data: session } = useSession();

  const [workspaces, setWorkspaces] = useState<WorkspaceWithSub[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [successWs, setSuccessWs] = useState<string | null>(null);

  const isPro = workspaces.some((w) => w.subscription?.tier === "PRO" && w.subscription?.status === "active");

  const fetchWorkspaces = useCallback(() => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: WorkspaceWithSub[]) => setWorkspaces(data))
      .finally(() => setLoadingWorkspaces(false));
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleUpgrade = async (workspaceId: string) => {
    if (upgrading) return;
    setUpgrading(workspaceId);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay. Please check your connection.");
        return;
      }

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to initiate payment");
        return;
      }

      const { orderId, amount, currency, keyId } = await res.json();

      const options = {
        key: keyId,
        amount,
        currency,
        name: "WorkspaceFlow",
        description: "Pro Plan — ₹999/month",
        order_id: orderId,
        prefill: {
          email: session?.user?.email ?? "",
          name: session?.user?.name ?? "",
        },
        theme: { color: "#6366f1" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              workspaceId,
            }),
          });
          if (verifyRes.ok) {
            setSuccessWs(workspaceId);
            fetchWorkspaces();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <header className="border-b border-[#1e1e2e] bg-[#0d0d14] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-sm font-medium text-white">Billing</span>
          </div>

          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(session.user.name ?? session.user.email ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white/60">{session.user.name ?? session.user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white/40 hover:text-white gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
          {/* Page title */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
            </div>
            <p className="text-white/40 text-sm ml-[52px]">
              Manage your subscription and workspace plans
            </p>
          </div>

          {/* Success banner */}
          {successWs && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white">You&apos;re on Pro!</p>
                <p className="text-sm text-white/50">Your workspace has been upgraded. All limits are now unlocked.</p>
              </div>
            </div>
          )}

          {/* Current plan banner */}
          <div
            className={cn(
              "rounded-2xl border p-6 flex items-center justify-between gap-4",
              isPro
                ? "border-indigo-500/30 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"
                : "border-[#1e1e2e] bg-[#111118]"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  isPro ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-[#1a1a26]"
                )}
              >
                {isPro ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <Zap className="w-6 h-6 text-white/40" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-white">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </h2>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {isPro ? "Active" : "Free"}
                  </Badge>
                </div>
                <p className="text-sm text-white/50 mt-0.5">
                  {isPro ? PLANS.PRO.description : PLANS.FREE.description}
                </p>
              </div>
            </div>
            {isPro ? (
              <Button variant="outline" className="shrink-0 gap-2" asChild>
                <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Razorpay Dashboard
                </a>
              </Button>
            ) : (
              <Button
                variant="gradient"
                className="shrink-0 gap-2"
                onClick={() => {
                  const free = workspaces.find((w) => w.subscription?.tier !== "PRO" && w.role === "OWNER");
                  if (free) handleUpgrade(free.id);
                }}
                loading={!!upgrading}
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            )}
          </div>

          {/* Plan comparison */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
              Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Free plan */}
              <div
                className={cn(
                  "rounded-2xl border p-6 relative",
                  !isPro
                    ? "border-indigo-500/30 bg-[#111118]"
                    : "border-[#1e1e2e] bg-[#0d0d14]"
                )}
              >
                {!isPro && (
                  <div className="absolute -top-3 left-5">
                    <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-white">{PLANS.FREE.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">{PLANS.FREE.price}</span>
                    <span className="text-white/40 text-sm">/month</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">{PLANS.FREE.description}</p>
                </div>
                <Separator className="mb-5" />
                <ul className="space-y-3">
                  {PLANS.FREE.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-white/60">
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white/40" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro plan */}
              <div
                className={cn(
                  "rounded-2xl border p-6 relative",
                  isPro
                    ? "border-indigo-500/30 bg-[#111118]"
                    : "border-[#2a2a3e] bg-[#0d0d14]"
                )}
              >
                {isPro && (
                  <div className="absolute -top-3 left-5">
                    <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-white">{PLANS.PRO.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">{PLANS.PRO.price}</span>
                    <span className="text-white/40 text-sm">/month</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1">{PLANS.PRO.description}</p>
                </div>
                <Separator className="mb-5" />
                <ul className="space-y-3 mb-6">
                  {PLANS.PRO.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-white/70">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                {!isPro && (
                  <Button
                    variant="gradient"
                    className="w-full gap-2"
                    onClick={() => {
                      const free = workspaces.find((w) => w.subscription?.tier !== "PRO" && w.role === "OWNER");
                      if (free) handleUpgrade(free.id);
                    }}
                    loading={!!upgrading}
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro — ₹999/month
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                )}
                {isPro && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Manage via Razorpay
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Workspaces list */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Your Workspaces
            </h2>
            <div className="rounded-2xl border border-[#1e1e2e] overflow-hidden">
              {loadingWorkspaces ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400/60" />
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/30 text-sm">No workspaces found</p>
                  <Link href="/dashboard?new=1">
                    <Button variant="outline" size="sm" className="mt-4">
                      Create Workspace
                    </Button>
                  </Link>
                </div>
              ) : (
                workspaces.map((ws, idx) => {
                  const subTier = ws.subscription?.tier ?? "FREE";
                  const subStatus = ws.subscription?.status;
                  const isWsPro = subTier === "PRO" && subStatus === "active";

                  return (
                    <div key={ws.id}>
                      {idx > 0 && <Separator />}
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: ws.color }}
                        >
                          {ws.icon ?? ws.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{ws.name}</p>
                          <p className="text-xs text-white/30 mt-0.5 truncate">
                            {ws.description ?? "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant={isWsPro ? "default" : "secondary"}>
                            {isWsPro ? (
                              <>
                                <Crown className="w-2.5 h-2.5" />
                                Pro
                              </>
                            ) : (
                              "Free"
                            )}
                          </Badge>
                          {!isWsPro && ws.role === "OWNER" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5"
                              loading={upgrading === ws.id}
                              onClick={() => handleUpgrade(ws.id)}
                            >
                              <Zap className="w-3 h-3" />
                              Upgrade
                            </Button>
                          )}
                          <Link href={`/workspace/${ws.slug}`}>
                            <Button variant="ghost" size="icon-sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Feature highlights */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
              Why Upgrade?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Building2,
                  title: "Unlimited Workspaces",
                  desc: "Create as many workspaces as your team needs",
                  color: "#6366f1",
                  bg: "rgba(99,102,241,0.15)",
                },
                {
                  icon: Users,
                  title: "Unlimited Members",
                  desc: "Invite your entire organization without limits",
                  color: "#10b981",
                  bg: "rgba(16,185,129,0.15)",
                },
                {
                  icon: BarChart3,
                  title: "AI-Powered Analytics",
                  desc: "Gemini AI insights and executive summaries",
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.15)",
                },
                {
                  icon: Shield,
                  title: "Priority Support",
                  desc: "Get help when you need it most",
                  color: "#ec4899",
                  bg: "rgba(236,72,153,0.15)",
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-4"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pb-4">
            <p className="text-xs text-white/25">
              Payments are processed securely by Razorpay. Cancel anytime.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
