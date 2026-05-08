"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

// Raw API response shape
interface ApiAnalytics {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  completedLast30: number;
  createdLast30: number;
  memberCount: number;
  completionRate: number;
  dailyData: Array<{ date: string; completed: number; created: number }>;
  priorityBreakdown: Record<string, number>;
}

// Transformed shape used in the component
interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  tasksOverTime: Array<{ date: string; created: number; completed: number }>;
  tasksByStatus: Array<{ status: string; count: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
}

function transformAnalytics(raw: ApiAnalytics): AnalyticsData & { createdLast30: number } {
  return {
    totalTasks: raw.totalTasks,
    completedTasks: raw.tasksByStatus["DONE"] ?? 0,
    inProgressTasks: raw.tasksByStatus["IN_PROGRESS"] ?? 0,
    completionRate: raw.completionRate,
    createdLast30: raw.createdLast30,
    tasksOverTime: raw.dailyData,
    tasksByStatus: Object.entries(raw.tasksByStatus).map(([status, count]) => ({ status, count })),
    tasksByPriority: Object.entries(raw.priorityBreakdown).map(([priority, count]) => ({ priority, count })),
  };
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "#6b7280",
  IN_PROGRESS: "#6366f1",
  REVIEW: "#f59e0b",
  DONE: "#10b981",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-5">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.value >= 0
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm font-medium text-white/60 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a26] border border-[#2a2a3e] rounded-xl p-3 shadow-2xl">
      {label && <p className="text-xs text-white/50 mb-2">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-white/60 capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [workspace, setWorkspace] = useState<(Workspace & { role?: string }) | null>(null);
  const [allWorkspaces, setAllWorkspaces] = useState<(Workspace & { role?: string })[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData & { createdLast30?: number } | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : []))
      .then((all: (Workspace & { role?: string })[]) => {
        const ws = all.find((w) => w.slug === slug) ?? null;
        setWorkspace(ws);
        setAllWorkspaces(all);
      })
      .finally(() => setLoadingWorkspace(false));
  }, [slug]);

  const loadAnalytics = useCallback(async () => {
    if (!workspace?.id) return;
    setLoadingAnalytics(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/analytics`);
      if (res.ok) {
        const raw: ApiAnalytics = await res.json();
        setAnalytics(transformAnalytics(raw));
      } else {
        setError("Failed to load analytics");
      }
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loadingWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <p className="text-white/40">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <WorkspaceSidebar workspace={workspace} allWorkspaces={allWorkspaces} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#1e1e2e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Analytics</h1>
              <p className="text-sm text-white/40 mt-0.5">Workspace performance overview</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-8 py-6 space-y-8 max-w-6xl">
            {loadingAnalytics ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400/60" />
              </div>
            ) : error ? (
              <div className="flex justify-center py-20">
                <p className="text-white/30 text-sm">{error}</p>
              </div>
            ) : analytics ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Tasks"
                    value={analytics.totalTasks}
                    icon={Target}
                    iconColor="#6366f1"
                    iconBg="rgba(99,102,241,0.15)"
                  />
                  <StatCard
                    title="Completed"
                    value={analytics.completedTasks}
                    icon={CheckCircle2}
                    iconColor="#10b981"
                    iconBg="rgba(16,185,129,0.15)"
                  />
                  <StatCard
                    title="In Progress"
                    value={analytics.inProgressTasks}
                    icon={Clock}
                    iconColor="#f59e0b"
                    iconBg="rgba(245,158,11,0.15)"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${analytics.completionRate}%`}
                    icon={TrendingUp}
                    iconColor="#6366f1"
                    iconBg="rgba(99,102,241,0.15)"
                    subtitle={`${analytics.completedTasks} of ${analytics.totalTasks} done`}
                  />
                </div>

                {/* Charts row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Area chart - takes 2/3 */}
                  <div className="lg:col-span-2 rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-4 h-4 text-white/40" />
                      <h3 className="text-sm font-semibold text-white/80">Tasks Over Time</h3>
                      <span className="text-xs text-white/30 ml-auto">Last 14 days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart
                        data={analytics.tasksOverTime}
                        margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                      >
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#2a2a3e"
                          tick={{ fill: "#ffffff40", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#2a2a3e"
                          tick={{ fill: "#ffffff40", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: "12px", color: "#ffffff60" }}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Area
                          type="monotone"
                          dataKey="created"
                          name="Created"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="url(#colorCreated)"
                          dot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="completed"
                          name="Completed"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#colorCompleted)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie chart - tasks by status */}
                  <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Activity className="w-4 h-4 text-white/40" />
                      <h3 className="text-sm font-semibold text-white/80">By Status</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={analytics.tasksByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="status"
                        >
                          {analytics.tasksByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[entry.status] ?? "#6b7280"}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as { status: string; count: number };
                            return (
                              <div className="bg-[#1a1a26] border border-[#2a2a3e] rounded-xl p-3 shadow-2xl text-sm">
                                <p className="text-white/60">{d.status.replace("_", " ")}</p>
                                <p className="font-bold text-white">{d.count} tasks</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {analytics.tasksByStatus.map((s) => (
                        <div key={s.status} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: STATUS_COLORS[s.status] ?? "#6b7280" }}
                            />
                            <span className="text-white/60">
                              {s.status.replace("_", " ")}
                            </span>
                          </div>
                          <span className="font-medium text-white/80 tabular-nums">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Charts row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bar chart - Priority */}
                  <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="w-4 h-4 text-white/40" />
                      <h3 className="text-sm font-semibold text-white/80">Priority Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={analytics.tasksByPriority}
                        margin={{ top: 5, right: 5, bottom: 5, left: -25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                        <XAxis
                          dataKey="priority"
                          stroke="#2a2a3e"
                          tick={{ fill: "#ffffff40", fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#2a2a3e"
                          tick={{ fill: "#ffffff40", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                          {analytics.tasksByPriority.map((entry, index) => (
                            <Cell
                              key={`bar-${index}`}
                              fill={PRIORITY_COLORS[entry.priority] ?? "#6b7280"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary stats */}
                  <div className="lg:col-span-2 rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Activity className="w-4 h-4 text-white/40" />
                      <h3 className="text-sm font-semibold text-white/80">Last 30 Days</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-4 text-center">
                        <p className="text-2xl font-bold text-white tabular-nums">
                          {analytics.createdLast30 ?? analytics.tasksOverTime.reduce((s, d) => s + d.created, 0)}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Tasks Created</p>
                      </div>
                      <div className="rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                          {analytics.tasksOverTime.reduce((s, d) => s + d.completed, 0)}
                        </p>
                        <p className="text-xs text-white/40 mt-1">Completed</p>
                      </div>
                      <div className="rounded-xl bg-[#0d0d14] border border-[#1e1e2e] p-4 text-center">
                        <p className="text-2xl font-bold text-indigo-400 tabular-nums">
                          {analytics.completionRate}%
                        </p>
                        <p className="text-xs text-white/40 mt-1">Completion Rate</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                        <span>Overall progress</span>
                        <span>{analytics.completedTasks} / {analytics.totalTasks} tasks</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1e1e2e] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                          style={{ width: `${analytics.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
