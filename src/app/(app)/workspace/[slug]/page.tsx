"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Calendar,
  MessageSquare,
  AlertCircle,
  Circle,
  ChevronUp,
  ChevronsUp,
  Minus,
  Check,
  Loader2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { cn, getInitials, getLabelColor, PRIORITY_CONFIG } from "@/lib/utils";
import type { Task, Workspace, TaskStatus, SocketUser } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: {
  id: TaskStatus;
  label: string;
  color: string;
  lightColor: string;
}[] = [
  { id: "TODO",        label: "To Do",       color: "#5a5a7a", lightColor: "rgba(90,90,122,0.07)"   },
  { id: "IN_PROGRESS", label: "In Progress", color: "#2dd4bf", lightColor: "rgba(45,212,191,0.08)"  },
  { id: "REVIEW",      label: "Review",      color: "#f59e0b", lightColor: "rgba(245,158,11,0.10)"  },
  { id: "DONE",        label: "Done",        color: "#22c55e", lightColor: "rgba(34,197,94,0.07)"   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };
  for (const task of tasks) {
    if (groups[task.status]) groups[task.status].push(task);
  }
  for (const key of Object.keys(groups) as TaskStatus[]) {
    groups[key].sort((a, b) => a.order - b.order);
  }
  return groups;
}

function isDueSoon(date: string | null): boolean {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60 * 48;
}

function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const config = PRIORITY_CONFIG[priority];
  const icons: Record<Task["priority"], React.ReactNode> = {
    LOW:    <Minus className="w-3 h-3" />,
    MEDIUM: <Circle className="w-3 h-3 fill-current" />,
    HIGH:   <ChevronUp className="w-3 h-3" />,
    URGENT: <ChevronsUp className="w-3 h-3" />,
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{ color: config.color, background: config.bg }}
      title={config.label}
    >
      {icons[priority]}
      {config.label}
    </span>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

function TaskCard({ task, index, onClick }: TaskCardProps) {
  const due = task.dueDate;
  const dueSoon = isDueSoon(due);
  const overdue = isOverdue(due);
  const commentCount = task._count?.comments ?? task.comments?.length ?? 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={cn(
            "kanban-card group relative rounded-xl border bg-[#111118] p-3.5 cursor-pointer select-none",
            "transition-all duration-150",
            snapshot.isDragging
              ? "border-[#2dd4bf]/50 shadow-2xl shadow-[#2dd4bf]/15 rotate-1 scale-[1.02] bg-[#15151f] z-50"
              : "border-[#1e1e2e] hover:border-[#2a2a3e] hover:shadow-lg hover:shadow-black/30"
          )}
          style={provided.draggableProps.style}
        >
          {/* Title */}
          <p className="text-sm font-medium text-white leading-snug mb-2.5">
            {task.title}
          </p>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {task.labels.slice(0, 3).map((label) => {
                const lc = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ color: lc.color, background: lc.bg }}
                  >
                    {label}
                  </span>
                );
              })}
              {task.labels.length > 3 && (
                <span className="text-[10px] text-white/30">
                  +{task.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <PriorityBadge priority={task.priority} />

              {due && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                    overdue
                      ? "text-red-400 bg-red-500/10"
                      : dueSoon
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-white/40 bg-white/5"
                  )}
                >
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(due).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {commentCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-white/35">
                  <MessageSquare className="w-3 h-3" />
                  {commentCount}
                </span>
              )}

              {task.assignee ? (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.image ?? ""} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignee.name ?? task.assignee.email)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-5 w-5 rounded-full border border-dashed border-[#2a2a3e]" />
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Quick Add Form ───────────────────────────────────────────────────────────

interface QuickAddFormProps {
  status: TaskStatus;
  workspaceId: string;
  onAdded: (task: Task) => void;
  onCancel: () => void;
}

function QuickAddForm({
  status,
  workspaceId,
  onAdded,
  onCancel,
}: QuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) { onCancel(); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, status }),
      });
      if (!res.ok) throw new Error("Failed");
      const task: Task = await res.json();
      onAdded(task);
      setTitle("");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="rounded-xl border border-[#2dd4bf]/30 bg-[#0f0f1c] p-2.5 shadow-lg shadow-[#2dd4bf]/08">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Task title…"
        disabled={loading}
        className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none mb-2"
      />
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="default"
          onClick={submit}
          disabled={!title.trim() || loading}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-white/25 ml-1">
          Enter · Esc to cancel
        </span>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColProps {
  col: (typeof COLUMNS)[number];
  tasks: Task[];
  workspaceId: string;
  onTaskClick: (task: Task) => void;
  onTaskAdded: (task: Task) => void;
}

function KanbanCol({
  col,
  tasks,
  workspaceId,
  onTaskClick,
  onTaskAdded,
}: KanbanColProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleAdded = (task: Task) => {
    onTaskAdded(task);
    setShowQuickAdd(false);
  };

  return (
    <div className="flex flex-col w-[300px] min-w-[300px]">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-3 border"
        style={{
          borderColor: `${col.color}35`,
          background: col.lightColor,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: col.color, boxShadow: `0 0 6px ${col.color}80` }}
          />
          <span className="text-sm font-semibold text-white">{col.label}</span>
          <span
            className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[11px] font-bold px-1.5"
            style={{
              background: `${col.color}20`,
              color: col.color,
            }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          data-quick-add={col.id}
          onClick={() => setShowQuickAdd(true)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
          title="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col gap-2.5 rounded-xl min-h-[100px] p-1.5 flex-1 transition-all duration-150",
              snapshot.isDraggingOver
                ? "bg-[#2dd4bf]/5 outline outline-1 outline-dashed outline-[#2dd4bf]/25"
                : "bg-transparent"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {/* Empty column hint */}
            {tasks.length === 0 && !snapshot.isDraggingOver && !showQuickAdd && (
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center justify-center h-16 rounded-lg border border-dashed border-[#1e1e2e] text-xs text-white/20 hover:border-[#2a2a3e] hover:text-white/35 transition-colors w-full"
              >
                Drop tasks here or click to add
              </button>
            )}
          </div>
        )}
      </Droppable>

      {/* Quick add area */}
      <div className="mt-2">
        {showQuickAdd ? (
          <QuickAddForm
            status={col.id}
            workspaceId={workspaceId}
            onAdded={handleAdded}
            onCancel={() => setShowQuickAdd(false)}
          />
        ) : (
          <button
            onClick={() => setShowQuickAdd(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-[#1a1a26] transition-all group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:text-[#2dd4bf] transition-colors" />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Online Presence Bar ──────────────────────────────────────────────────────

function OnlineBar({ users }: { users: SocketUser[] }) {
  if (users.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30 hidden sm:block">Online</span>
      <div className="flex items-center -space-x-1.5">
        {users.slice(0, 7).map((u) => (
          <div key={u.userId} className="relative" title={u.name ?? "User"}>
            <Avatar className="h-6 w-6 border-2 border-[#0a0a0f]">
              <AvatarImage src={u.image ?? ""} />
              <AvatarFallback className="text-[9px]">
                {getInitials(u.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-[#0a0a0f] pulse-glow" />
          </div>
        ))}
        {users.length > 7 && (
          <div className="h-6 w-6 rounded-full border-2 border-[#0a0a0f] bg-[#1e1e2e] flex items-center justify-center">
            <span className="text-[9px] text-white/50">+{users.length - 7}</span>
          </div>
        )}
      </div>
      <span className="text-xs text-white/25">{users.length}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function KanbanSkeleton() {
  return (
    <div className="flex gap-4">
      {COLUMNS.map((col) => (
        <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col gap-2.5">
          <div className="h-10 rounded-xl shimmer" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-3.5 space-y-2"
            >
              <div className="h-3.5 w-3/4 shimmer rounded" />
              <div className="h-3 w-1/2 shimmer rounded" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-16 shimmer rounded" />
                <div className="h-5 w-5 rounded-full shimmer" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspaceBoardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: session, status: authStatus } = useSession();

  const [workspace, setWorkspace] = useState<(Workspace & { role?: string }) | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [loadingWs, setLoadingWs] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspace by slug
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("Failed to load workspaces");
        const data: (Workspace & { role?: string })[] = await res.json();
        const found = data.find((w) => w.slug === slug);
        if (!found) {
          setError("Workspace not found or you don't have access.");
        } else {
          setWorkspace(found);
        }
      } catch {
        setError("Failed to load workspace.");
      } finally {
        setLoadingWs(false);
      }
    })();
  }, [authStatus, slug]);

  // Fetch tasks
  useEffect(() => {
    if (!workspace?.id) return;
    setLoadingTasks(true);
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspace.id}/tasks`);
        if (!res.ok) throw new Error();
        const data: Task[] = await res.json();
        setTasks(data);
      } catch {
        toast.error("Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    })();
  }, [workspace?.id]);

  // Socket
  const { emit, on } = useSocket(workspace?.id ?? null);

  useEffect(() => {
    if (!workspace?.id) return;

    const handlers = [
      on("users-online", (users) => setOnlineUsers(users as SocketUser[])),
      on("user-joined", (user) => {
        const u = user as SocketUser;
        setOnlineUsers((prev) =>
          prev.find((p) => p.userId === u.userId) ? prev : [...prev, u]
        );
      }),
      on("user-left", (data) => {
        const { userId } = data as { userId: string };
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== userId));
      }),
      on("task-created", (task) => {
        const t = task as Task;
        setTasks((prev) => (prev.find((p) => p.id === t.id) ? prev : [...prev, t]));
      }),
      on("task-updated", (task) => {
        const t = task as Task;
        setTasks((prev) => prev.map((p) => (p.id === t.id ? t : p)));
      }),
      on("task-moved", (data) => {
        const { taskId, status, order } = data as {
          taskId: string;
          status: TaskStatus;
          order?: number;
        };
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status, order: order ?? t.order } : t
          )
        );
      }),
      on("task-deleted", (data) => {
        const { taskId } = data as { taskId: string };
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }),
    ];

    return () => {
      handlers.forEach((unsub) => typeof unsub === "function" && unsub());
    };
  }, [workspace?.id, on]);

  // Drag & drop handler
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination || !workspace) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) return;

      const newStatus = destination.droppableId as TaskStatus;
      const prevStatus = source.droppableId as TaskStatus;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
      );

      try {
        const res = await fetch(`/api/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error();
        const updated: Task = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === draggableId ? updated : t))
        );
        emit("task-moved", {
          workspaceId: workspace.id,
          taskId: draggableId,
          status: newStatus,
          movedBy: session?.user?.id,
        });
      } catch {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.id === draggableId ? { ...t, status: prevStatus } : t
          )
        );
        toast.error("Failed to move task");
      }
    },
    [workspace, emit, session?.user?.id]
  );

  const handleTaskClick = (task: Task) => {
    // TODO: open TaskDetailModal
    console.log("Task clicked:", task);
  };

  const handleTaskAdded = useCallback(
    (task: Task) => {
      setTasks((prev) =>
        prev.find((p) => p.id === task.id) ? prev : [...prev, task]
      );
      if (workspace) {
        emit("task-created", { workspaceId: workspace.id, task });
      }
    },
    [workspace, emit]
  );

  const grouped = groupTasksByStatus(tasks);

  // ── Loading ──
  if (loadingWs || authStatus === "loading") {
    return (
      <div className="flex flex-col h-full">
        <div className="h-14 border-b border-[#1e1e2e] shimmer shrink-0" />
        <div className="flex-1 p-6 overflow-auto">
          <KanbanSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Workspace not found</h2>
          <p className="text-sm text-white/50">
            {error ?? "This workspace doesn't exist or you don't have access."}
          </p>
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Board top bar */}
      <header className="flex items-center justify-between gap-4 px-5 h-14 border-b border-[#1e1e2e] bg-[#0a0a0f]/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[11px] shrink-0"
            style={{ background: workspace.color }}
          >
            {workspace.icon ?? workspace.name[0].toUpperCase()}
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-semibold text-white text-sm">{workspace.name}</h1>
            <span className="text-white/30 text-xs hidden md:block">/ Board</span>
          </div>
          {!loadingTasks && (
            <span className="text-xs text-white/30 hidden sm:block">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <OnlineBar users={onlineUsers} />

          <Button
            size="sm"
            variant="default"
            className="gap-1.5 shrink-0"
            onClick={() => {
              // Click the first column's quick-add button
              document
                .querySelector<HTMLButtonElement>("[data-quick-add='TODO']")
                ?.click();
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </header>

      {/* Kanban board */}
      <div className="flex-1 overflow-auto p-5">
        {loadingTasks ? (
          <KanbanSkeleton />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full pb-4 min-w-max">
              {COLUMNS.map((col) => (
                <KanbanCol
                  key={col.id}
                  col={col}
                  tasks={grouped[col.id]}
                  workspaceId={workspace.id}
                  onTaskClick={handleTaskClick}
                  onTaskAdded={handleTaskAdded}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
