"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Tag,
  User,
  Clock,
  Send,
  Eye,
  Edit3,
  X,
  Plus,
  Activity,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn, getInitials, formatRelativeTime, formatDate, PRIORITY_CONFIG, STATUS_CONFIG, LABEL_COLORS, getLabelColor } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import type { Task, TaskComment, WorkspaceMember, Activity as ActivityType } from "@/types";

interface TaskDetailModalProps {
  task: Task;
  workspaceId: string;
  members: WorkspaceMember[];
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (updated: Task) => void;
}

const ALL_LABELS = LABEL_COLORS.map((l) => l.name);

export function TaskDetailModal({
  task: initialTask,
  workspaceId,
  members,
  isOpen,
  onClose,
  onTaskUpdate,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<Task>(initialTask);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(initialTask.title);
  const [descValue, setDescValue] = useState(initialTask.description ?? "");
  const [descPreview, setDescPreview] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>(initialTask.comments ?? []);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const patchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const descDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const { emit, on } = useSocket(workspaceId);

  // Sync when task prop changes
  useEffect(() => {
    setTask(initialTask);
    setTitleValue(initialTask.title);
    setDescValue(initialTask.description ?? "");
    setComments(initialTask.comments ?? []);
  }, [initialTask]);

  // Socket listeners
  useEffect(() => {
    if (!isOpen) return;

    const offComment = on("comment-added", (data: unknown) => {
      const d = data as { taskId: string; comment: TaskComment };
      if (d.taskId === task.id) {
        setComments((prev) => {
          if (prev.find((c) => c.id === d.comment.id)) return prev;
          return [...prev, d.comment];
        });
      }
    });

    const offTypingStart = on("typing-start", (data: unknown) => {
      const d = data as { taskId: string; userName: string };
      if (d.taskId === task.id) {
        setTypingUsers((prev) =>
          prev.includes(d.userName) ? prev : [...prev, d.userName]
        );
      }
    });

    const offTypingStop = on("typing-stop", (data: unknown) => {
      const d = data as { taskId: string; userName: string };
      if (d.taskId === task.id) {
        setTypingUsers((prev) => prev.filter((u) => u !== d.userName));
      }
    });

    return () => {
      offComment();
      offTypingStart();
      offTypingStop();
    };
  }, [isOpen, task.id, on]);

  // Fetch activity log
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/workspaces/${workspaceId}/activity?taskId=${task.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: ActivityType[]) => setActivities(data.slice(0, 10)))
      .catch(() => {});
  }, [isOpen, workspaceId, task.id]);

  // Scroll to bottom of comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const patchTask = useCallback(
    async (fields: Partial<Task>) => {
      const updated = { ...task, ...fields };
      setTask(updated);
      onTaskUpdate(updated);
      setSavingField(Object.keys(fields)[0]);
      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        if (res.ok) {
          const data: Task = await res.json();
          setTask(data);
          onTaskUpdate(data);
        }
      } finally {
        setSavingField(null);
      }
    },
    [task, onTaskUpdate]
  );

  const handleTitleBlur = () => {
    setTitleEditing(false);
    if (titleValue.trim() && titleValue.trim() !== task.title) {
      patchTask({ title: titleValue.trim() });
    }
  };

  const handleDescChange = (val: string) => {
    setDescValue(val);
    if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    descDebounceRef.current = setTimeout(() => {
      patchTask({ description: val });
    }, 1500);
  };

  const handleStatusChange = (status: string) => {
    patchTask({ status: status as Task["status"] });
  };

  const handlePriorityChange = (priority: string) => {
    patchTask({ priority: priority as Task["priority"] });
  };

  const handleAssigneeChange = (val: string) => {
    const assigneeId = val === "unassigned" ? null : val;
    const assignee = members.find((m) => m.userId === assigneeId)?.user ?? null;
    patchTask({ assigneeId, assignee });
  };

  const handleDueDateChange = (val: string) => {
    patchTask({ dueDate: val ? new Date(val).toISOString() : null });
  };

  const handleLabelToggle = (label: string) => {
    const current = task.labels ?? [];
    const next = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    if (patchDebounceRef.current) clearTimeout(patchDebounceRef.current);
    patchDebounceRef.current = setTimeout(() => {
      patchTask({ labels: next });
    }, 300);
    setTask((t) => ({ ...t, labels: next }));
  };

  const handleCommentFocus = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emit("typing-start", { taskId: task.id, workspaceId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emit("typing-stop", { taskId: task.id, workspaceId });
    }, 3000);
  };

  const handleCommentBlur = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emit("typing-stop", { taskId: task.id, workspaceId });
    }
  };

  const generateAiDescription = async () => {
    setGeneratingDesc(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, priority: task.priority, labels: task.labels }),
      });
      if (res.ok) {
        const { description } = await res.json();
        handleDescChange(description);
      }
    } catch {
      // silently fail
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);
    handleCommentBlur();
    const body = commentInput.trim();
    setCommentInput("");
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body }),
      });
      if (res.ok) {
        const comment: TaskComment = await res.json();
        setComments((prev) => {
          if (prev.find((c) => c.id === comment.id)) return prev;
          return [...prev, comment];
        });
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const assignedMember = members.find((m) => m.userId === task.assigneeId);
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="full" showClose className="flex flex-col overflow-hidden p-0">
        <div className="flex flex-1 overflow-hidden">
          {/* ─── Left Panel (2/3) ─── */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-[#1e1e2e]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#1e1e2e]">
              {/* Title */}
              {titleEditing ? (
                <input
                  ref={titleInputRef}
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") titleInputRef.current?.blur();
                    if (e.key === "Escape") {
                      setTitleValue(task.title);
                      setTitleEditing(false);
                    }
                  }}
                  className="w-full bg-transparent text-xl font-semibold text-white outline-none border-b border-indigo-500/50 pb-1 focus:border-indigo-400"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-xl font-semibold text-white cursor-pointer hover:text-indigo-300 transition-colors pr-8 leading-snug"
                  onClick={() => setTitleEditing(true)}
                  title="Click to edit title"
                >
                  {task.title}
                </h2>
              )}

              {/* Status + Priority row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 w-auto gap-1.5 text-xs px-2.5 border-0 rounded-full"
                    style={{ background: `${statusCfg.color}22`, color: statusCfg.color }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusCfg.color }} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: v.color }} />
                          {v.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-7 w-auto gap-1.5 text-xs px-2.5 border-0 rounded-full"
                    style={{ background: priorityCfg.bg, color: priorityCfg.color }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <span style={{ color: v.color }}>{v.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {savingField && (
                  <span className="flex items-center gap-1.5 text-xs text-white/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving…
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                      Description
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateAiDescription}
                        loading={generatingDesc}
                        className="h-6 px-2 text-[10px] text-indigo-400/70 hover:text-indigo-400 hover:bg-indigo-500/10"
                        title="Generate description with AI"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDescPreview(!descPreview)}
                        title={descPreview ? "Edit" : "Preview"}
                      >
                        {descPreview ? (
                          <Edit3 className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {descPreview ? (
                    <div
                      className={cn(
                        "min-h-[120px] rounded-xl border border-[#2a2a3e] bg-[#0d0d14] p-4",
                        "prose prose-invert prose-sm max-w-none text-white/70"
                      )}
                    >
                      {descValue ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-white/70">{descValue}</pre>
                      ) : (
                        <p className="text-white/30 italic text-sm">No description</p>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      value={descValue}
                      onChange={(e) => handleDescChange(e.target.value)}
                      placeholder="Add a description… (supports markdown)"
                      className="min-h-[120px] resize-none bg-[#0d0d14] border-[#2a2a3e] text-white/80 placeholder:text-white/25 focus:border-indigo-500/40"
                    />
                  )}
                </div>

                <Separator />

                {/* Comments */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium text-white/70">
                      Comments{comments.length > 0 && <span className="ml-1.5 text-white/30">({comments.length})</span>}
                    </span>
                  </div>

                  {/* Comment list */}
                  <div className="space-y-4 mb-4">
                    {comments.length === 0 && (
                      <p className="text-sm text-white/30 text-center py-6">
                        No comments yet. Start the conversation.
                      </p>
                    )}
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarImage src={comment.user.image ?? ""} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(comment.user.name ?? comment.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-medium text-white/90">
                              {comment.user.name ?? comment.user.email}
                            </span>
                            <span className="text-xs text-white/30">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm text-white/70 bg-[#0d0d14] rounded-xl px-3.5 py-2.5 border border-[#1e1e2e] leading-relaxed">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-white/40 animate-pulse pl-10">
                        <span className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
                      </div>
                    )}
                    <div ref={commentsEndRef} />
                  </div>

                  {/* Comment input */}
                  <div className="flex gap-3 items-end">
                    <Textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onFocus={handleCommentFocus}
                      onBlur={handleCommentBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          handleSubmitComment();
                        }
                      }}
                      placeholder="Write a comment… (⌘Enter to submit)"
                      className="flex-1 min-h-[72px] resize-none bg-[#0d0d14] border-[#2a2a3e] text-white/80 placeholder:text-white/25 focus:border-indigo-500/40"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!commentInput.trim() || submittingComment}
                      loading={submittingComment}
                      size="icon"
                      className="h-[72px] w-10 shrink-0 rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* ─── Right Sidebar (1/3) ─── */}
          <div className="w-72 shrink-0 flex flex-col overflow-hidden bg-[#0d0d14]">
            <div className="px-4 pt-5 pb-3 border-b border-[#1e1e2e]">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Details</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-4 py-4 space-y-5">
                {/* Assignee */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/40 mb-2 font-medium">
                    <User className="w-3.5 h-3.5" /> Assignee
                  </label>
                  <Select
                    value={task.assigneeId ?? "unassigned"}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="h-9 text-sm bg-[#111118]">
                      <div className="flex items-center gap-2 min-w-0">
                        {task.assigneeId && assignedMember ? (
                          <>
                            <Avatar className="h-5 w-5 shrink-0">
                              <AvatarImage src={assignedMember.user.image ?? ""} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(assignedMember.user.name ?? assignedMember.user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {assignedMember.user.name ?? assignedMember.user.email}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/30">Unassigned</span>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <span className="text-white/40">Unassigned</span>
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          <span className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 shrink-0">
                              <AvatarImage src={m.user.image ?? ""} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(m.user.name ?? m.user.email)}
                              </AvatarFallback>
                            </Avatar>
                            {m.user.name ?? m.user.email}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/40 mb-2 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className={cn(
                      "w-full h-9 px-3 rounded-lg border border-[#2a2a3e] bg-[#111118] text-sm text-white/80",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                      "[color-scheme:dark]"
                    )}
                  />
                  {task.dueDate && (
                    <p className={cn(
                      "mt-1 text-xs",
                      new Date(task.dueDate) < new Date() && task.status !== "DONE"
                        ? "text-red-400"
                        : "text-white/30"
                    )}>
                      {new Date(task.dueDate) < new Date() && task.status !== "DONE"
                        ? "Overdue"
                        : `Due ${formatDate(task.dueDate)}`}
                    </p>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-white/40 mb-2 font-medium">
                    <Tag className="w-3.5 h-3.5" /> Labels
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(task.labels ?? []).map((label) => {
                      const lc = getLabelColor(label);
                      return (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer group"
                          style={{ background: lc.bg, color: lc.color }}
                          onClick={() => handleLabelToggle(label)}
                          title="Click to remove"
                        >
                          {label}
                          <X className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </span>
                      );
                    })}
                    <button
                      onClick={() => setLabelMenuOpen(!labelMenuOpen)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border border-dashed border-[#3a3a52] text-white/30 hover:text-white/60 hover:border-white/30 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Add
                    </button>
                  </div>
                  {labelMenuOpen && (
                    <div className="rounded-xl border border-[#2a2a3e] bg-[#111118] p-2 space-y-0.5">
                      {ALL_LABELS.map((label) => {
                        const lc = getLabelColor(label);
                        const active = (task.labels ?? []).includes(label);
                        return (
                          <button
                            key={label}
                            onClick={() => handleLabelToggle(label)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors",
                              active ? "bg-[#1e1e2e]" : "hover:bg-[#1a1a26]"
                            )}
                          >
                            <span
                              className="inline-flex items-center gap-2"
                              style={{ color: lc.color }}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ background: lc.color }} />
                              {label}
                            </span>
                            {active && (
                              <span className="text-xs text-white/30">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Timestamps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Created
                    </span>
                    <span className="text-white/50">{formatRelativeTime(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Updated
                    </span>
                    <span className="text-white/50">{formatRelativeTime(task.updatedAt)}</span>
                  </div>
                </div>

                {/* Activity Log */}
                {activities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                          Activity
                        </span>
                      </div>
                      <div className="space-y-3">
                        {activities.map((act) => (
                          <div key={act.id} className="flex gap-2.5">
                            <Avatar className="h-5 w-5 shrink-0 mt-0.5">
                              <AvatarImage src={act.user.image ?? ""} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(act.user.name ?? act.user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/60 leading-relaxed">
                                <span className="font-medium text-white/80">
                                  {act.user.name ?? act.user.email}
                                </span>{" "}
                                {act.action}
                              </p>
                              <p className="text-[10px] text-white/25 mt-0.5">
                                {formatRelativeTime(act.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
