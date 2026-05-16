"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, Users, Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/hooks/use-socket";
import { getInitials, formatRelativeTime } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
};

type OnlineUser = { userId: string; name: string | null; image: string | null };

const ACCENT = "#ff5c00";
const BG = "#0f0d0b";
const SURFACE = "#1c1916";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#f0f0f8";
const MUTED = "rgba(240,240,248,0.5)";

export default function ChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmit = useRef(0);

  const { emit, on } = useSocket(workspaceId || null);

  // Resolve workspace ID from slug
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/workspaces/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ws) => { if (ws) setWorkspaceId(ws.id); });
  }, [slug]);

  // Load history
  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/workspaces/${workspaceId}/messages?limit=80`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Message[]) => setMessages(data))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  // Socket listeners
  useEffect(() => {
    if (!workspaceId) return;

    const offMsg = on("chat-message", (...args: unknown[]) => {
      const m = args[0] as Message;
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });

    const offPresence = on("presence-update", (...args: unknown[]) => {
      setOnline(args[0] as OnlineUser[]);
    });

    const offTypingStart = on("chat-typing-start", (...args: unknown[]) => {
      const { userId, name } = args[0] as { userId: string; name: string };
      setTypingUsers((prev) => new Map(prev).set(userId, name || "Someone"));
    });

    const offTypingStop = on("chat-typing-stop", (...args: unknown[]) => {
      const { userId } = args[0] as { userId: string };
      setTypingUsers((prev) => { const n = new Map(prev); n.delete(userId); return n; });
    });

    return () => { offMsg?.(); offPresence?.(); offTypingStart?.(); offTypingStop?.(); };
  }, [workspaceId, on]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingUsers.size]);

  const sendMessage = useCallback(async () => {
    const content = draft.trim();
    if (!content || sending || !workspaceId) return;
    setSending(true);
    setDraft("");
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
        emit("chat-message", { workspaceId, message: msg });
        emit("chat-typing-stop", { workspaceId, userId: session?.user?.id });
      } else {
        setDraft(content);
      }
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  }, [draft, sending, workspaceId, emit, session?.user?.id]);

  const onInput = (val: string) => {
    setDraft(val);
    if (!workspaceId || !session?.user?.id) return;

    const now = Date.now();
    if (now - lastTypingEmit.current > 1500) {
      emit("chat-typing-start", { workspaceId, userId: session.user.id, name: session.user.name });
      lastTypingEmit.current = now;
    }

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emit("chat-typing-stop", { workspaceId, userId: session?.user?.id });
      lastTypingEmit.current = 0;
    }, 2200);
  };

  // Group consecutive messages from same user
  const grouped = groupMessages(messages);

  return (
    <div className="flex h-screen" style={{ background: BG, color: TEXT }}>
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 h-14 shrink-0"
          style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,92,0,0.12)", border: "1px solid rgba(255,92,0,0.25)" }}
            >
              <Hash className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold leading-tight" style={{ letterSpacing: "-0.01em" }}>general</h1>
              <p className="text-[11px]" style={{ color: MUTED, fontFamily: "var(--font-mono)" }}>
                {online.length} online · {messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center -space-x-2">
            {online.slice(0, 5).map((u) => (
              <div key={u.userId} className="relative" title={u.name ?? "Member"}>
                <Avatar className="h-7 w-7 border-2" style={{ borderColor: BG }}>
                  <AvatarImage src={u.image ?? ""} />
                  <AvatarFallback className="text-[10px] font-semibold" style={{ background: "rgba(255,92,0,0.15)", color: ACCENT }}>
                    {getInitials(u.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: "#22c55e", borderColor: BG }}
                />
              </div>
            ))}
            {online.length > 5 && (
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2"
                style={{ background: SURFACE, borderColor: BG, color: MUTED }}
              >
                +{online.length - 5}
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full" style={{ color: MUTED }}>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> loading history…
            </div>
          ) : messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5 max-w-[860px] mx-auto">
              {grouped.map((g, gi) => {
                const isMe = g.userId === session?.user?.id;
                return (
                  <motion.div
                    key={g.firstId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(gi * 0.01, 0.2) }}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarImage src={g.image ?? ""} />
                      <AvatarFallback className="text-[10px] font-semibold" style={{ background: isMe ? ACCENT : "rgba(255,92,0,0.15)", color: isMe ? BG : ACCENT }}>
                        {getInitials(g.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[13px] font-semibold" style={{ color: isMe ? ACCENT : TEXT }}>
                          {g.name ?? "User"}{isMe && <span className="text-[10px] opacity-60 ml-1.5" style={{ fontFamily: "var(--font-mono)" }}>you</span>}
                        </span>
                        <span className="text-[10px]" style={{ color: MUTED, fontFamily: "var(--font-mono)" }}>
                          {formatRelativeTime(new Date(g.createdAt))}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {g.messages.map((m) => (
                          <p key={m.id} className="text-[14px] leading-relaxed break-words whitespace-pre-wrap" style={{ color: "rgba(240,240,248,0.85)" }}>
                            {m.content}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {typingUsers.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[12px]"
                    style={{ color: MUTED, fontFamily: "var(--font-mono)" }}
                  >
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ background: ACCENT }}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                    {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing…
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-6 pb-6 pt-3 shrink-0">
          <div className="max-w-[860px] mx-auto">
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <textarea
                value={draft}
                onChange={(e) => onInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder="Message #general — Enter to send, Shift+Enter for new line"
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2 px-1 min-h-[24px] max-h-[140px]"
                style={{ color: TEXT, fontFamily: "inherit" }}
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                disabled={!draft.trim() || sending}
                onClick={sendMessage}
                className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ background: ACCENT, color: BG }}
                aria-label="Send"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: MUTED, fontFamily: "var(--font-mono)" }}>
              messages are saved forever · new members see full history
            </p>
          </div>
        </div>
      </div>

      {/* Right rail — online members */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0" style={{ borderLeft: `1px solid ${BORDER}`, background: BG }}>
        <div className="h-14 px-5 flex items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <Users className="w-3.5 h-3.5 mr-2" style={{ color: MUTED }} />
          <span className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: MUTED, fontFamily: "var(--font-mono)" }}>Online</span>
          <span
            className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
          >
            {online.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {online.length === 0 ? (
            <p className="px-3 text-[12px]" style={{ color: MUTED }}>nobody else online</p>
          ) : (
            online.map((u) => (
              <div key={u.userId} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ color: TEXT }}>
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.image ?? ""} />
                    <AvatarFallback className="text-[9px] font-semibold" style={{ background: "rgba(255,92,0,0.15)", color: ACCENT }}>
                      {getInitials(u.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: "#22c55e", borderColor: BG }} />
                </div>
                <span className="text-[13px] truncate flex-1">{u.name ?? "Member"}</span>
                {u.userId === session?.user?.id && (
                  <span className="text-[9px] uppercase tracking-widest font-mono" style={{ color: MUTED }}>you</span>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function groupMessages(messages: Message[]) {
  type Group = { firstId: string; userId: string; name: string | null; image: string | null; createdAt: string; messages: Message[] };
  const groups: Group[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    const sameUser = last && last.userId === m.userId;
    const within2min = last && (new Date(m.createdAt).getTime() - new Date(last.createdAt).getTime()) < 2 * 60 * 1000;
    if (sameUser && within2min) {
      last.messages.push(m);
    } else {
      groups.push({
        firstId: m.id,
        userId: m.userId,
        name: m.user.name,
        image: m.user.image,
        createdAt: m.createdAt,
        messages: [m],
      });
    }
  }
  return groups;
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-sm">
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.2)" }}
        >
          <Sparkles className="w-5 h-5" style={{ color: ACCENT }} />
        </div>
        <h2 className="text-[18px] font-semibold mb-2" style={{ color: TEXT, letterSpacing: "-0.01em" }}>
          This is the beginning of <span style={{ color: ACCENT }}>#general</span>.
        </h2>
        <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>
          Say hi to the team. Messages are saved forever — new teammates will see the full history when they join.
        </p>
      </div>
    </div>
  );
}
