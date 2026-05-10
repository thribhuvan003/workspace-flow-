"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, LayoutGrid, Users, BarChart3, FileText, Zap, Plug, Sun, Moon } from "lucide-react";

// ─── Spring presets ────────────────────────────────────────────────────────────

const SP = { type: "spring" as const, stiffness: 300, damping: 30 };
const SP_SLOW = { type: "spring" as const, stiffness: 110, damping: 22 };

// ─── Theme system ──────────────────────────────────────────────────────────────

const DARK = {
  bg:       "#0f0d0b",
  bg2:      "#1c1916",
  bg3:      "#242018",
  ink:      "#e8e0d5",
  ink2:     "rgba(232,224,213,0.62)",
  ink3:     "rgba(232,224,213,0.36)",
  ink4:     "rgba(232,224,213,0.18)",
  accent:   "#ff5c00",
  accentBg: "rgba(255,92,0,0.1)",
  accentBd: "rgba(255,92,0,0.24)",
  line:     "rgba(232,224,213,0.07)",
  lineHi:   "rgba(232,224,213,0.13)",
  shadow:   "rgba(0,0,0,0.5)",
};

const LIGHT = {
  bg:       "#f5ede0",
  bg2:      "#ede2d0",
  bg3:      "#e0d4be",
  ink:      "#1a1208",
  ink2:     "rgba(26,18,8,0.62)",
  ink3:     "rgba(26,18,8,0.36)",
  ink4:     "rgba(26,18,8,0.18)",
  accent:   "#c03800",
  accentBg: "rgba(192,56,0,0.08)",
  accentBd: "rgba(192,56,0,0.2)",
  line:     "rgba(26,18,8,0.09)",
  lineHi:   "rgba(26,18,8,0.15)",
  shadow:   "rgba(0,0,0,0.12)",
};

type Theme = typeof DARK;

// ─── Shared utils ──────────────────────────────────────────────────────────────

function AnimWords({ text, delay = 0, c }: { text: string; delay?: number; c: Theme }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} className="inline-block" style={{ marginRight: "0.22em" }}
          initial={{ opacity: 0, y: 30, rotate: 1.2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SP, delay: delay + i * 0.07 }}>
          {w}
        </motion.span>
      ))}
    </>
  );
}

function Reveal({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SP, delay }}>
      {children}
    </motion.div>
  );
}

function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2"  y="2"  width="10" height="10" rx="2.5" fill="currentColor" />
      <rect x="16" y="2"  width="10" height="10" rx="2.5" fill="currentColor" opacity="0.45" />
      <rect x="2"  y="16" width="10" height="10" rx="2.5" fill="currentColor" opacity="0.45" />
      <rect x="16" y="16" width="10" height="10" rx="2.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ c, dark, onToggle }: { c: Theme; dark: boolean; onToggle: () => void }) {
  const { scrollY } = useScroll();
  const bgA = useTransform(scrollY, [0, 60], [0, 0.92]);
  const blurV = useTransform(scrollY, [0, 60], [0, 16]);

  return (
    <motion.header className="fixed top-0 inset-x-0 z-50"
      style={{ backdropFilter: `blur(${blurV}px)` as unknown as string }}>
      <motion.div
        className="flex items-center justify-between h-14 px-5 sm:px-8 max-w-6xl mx-auto"
        style={{ borderBottom: `1px solid ${c.line}`, backgroundColor: `color-mix(in srgb, ${c.bg} calc(${bgA} * 100%), transparent)` } as React.CSSProperties}>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.08 }}>
          <Link href="/" className="flex items-center gap-2.5" style={{ color: c.accent }}>
            <Logo size={18} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, letterSpacing: "-0.03em", color: c.ink }}>
              WorkspaceFlow
            </span>
          </Link>
        </motion.div>

        {/* Actions */}
        <motion.div className="flex items-center gap-2"
          initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.12 }}>

          {/* Theme toggle */}
          <motion.button
            onClick={onToggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: c.accentBg, border: `1px solid ${c.accentBd}`, color: c.accent }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            <motion.div
              key={dark ? "moon" : "sun"}
              initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ ...SP }}>
              {dark ? <Moon size={14} /> : <Sun size={14} />}
            </motion.div>
          </motion.button>

          <Link href="/login"
            className="hidden sm:inline-flex text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors"
            style={{ color: c.ink3 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.ink3)}>
            Sign in
          </Link>

          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-xl"
              style={{ background: c.accent, color: "#fff", boxShadow: `0 0 20px ${c.accentBg}` }}>
              Get started <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

// ─── Kanban preview ────────────────────────────────────────────────────────────

const BOARD_COLS = [
  { id: "todo",   label: "To Do",       dot: "#5a5060",
    cards: [{ t: "Auth flow redesign", tag: "Design" }, { t: "Rate limiting", tag: "Backend" }] },
  { id: "prog",   label: "In Progress", dot: "#ff5c00",
    cards: [{ t: "Kanban drag & drop", tag: "Feature" }, { t: "Socket.io rooms", tag: "Backend" }, { t: "Mobile layout", tag: "Frontend" }] },
  { id: "review", label: "Review",      dot: "#f59e0b",
    cards: [{ t: "Analytics v1", tag: "Feature" }, { t: "Invite emails", tag: "Backend" }] },
  { id: "done",   label: "Done",        dot: "#22c55e",
    cards: [{ t: "NextAuth v5 setup", tag: "Security" }, { t: "Prisma schema", tag: "Backend" }] },
];
const TAG_CLR: Record<string, string> = { Design: "#a78bfa", Backend: "#60a5fa", Frontend: "#f472b6", Feature: "#ff5c00", Security: "#22c55e" };

function KanbanPreview({ c }: { c: Theme }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className="rounded-2xl overflow-hidden select-none"
      style={{ border: `1px solid ${c.lineHi}`, background: c.bg2 }}
      initial={{ opacity: 0, y: 44, scale: 0.97 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ ...SP_SLOW, delay: 0.08 }}>
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-4 h-9" style={{ background: c.bg3, borderBottom: `1px solid ${c.line}` }}>
        {["#ef4444","#f59e0b","#22c55e"].map((col, i) => (
          <motion.span key={col} className="w-2 h-2 rounded-full" style={{ background: col, opacity: 0.7 }}
            initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.28 + i * 0.06, type: "spring" as const, stiffness: 420 }} />
        ))}
        <div className="ml-3 flex items-center px-2 h-5 rounded" style={{ background: c.line, minWidth: 140 }}>
          <span className="text-[10px]" style={{ color: c.ink4, fontFamily: "var(--font-mono)" }}>
            app.workspaceflow.io/board
          </span>
        </div>
      </div>
      <div className="flex">
        {/* Mini sidebar */}
        <div className="w-9 flex flex-col items-center pt-3 gap-3 shrink-0" style={{ borderRight: `1px solid ${c.line}` }}>
          {[LayoutGrid, FileText, Users, BarChart3].map((Icon, i) => (
            <motion.div key={i} className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: i === 0 ? c.accentBg : "transparent", color: i === 0 ? c.accent : c.ink4 }}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.38 + i * 0.07 }}>
              <Icon size={11} />
            </motion.div>
          ))}
        </div>
        {/* Board */}
        <div className="flex-1 overflow-x-auto p-3">
          <div className="flex gap-2 min-w-max">
            {BOARD_COLS.map((col, ci) => (
              <div key={col.id} className="w-[144px] shrink-0">
                <motion.div className="flex items-center gap-1.5 mb-2"
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.33 + ci * 0.07 }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                  <span className="text-[10px] font-semibold" style={{ color: c.ink2, fontFamily: "var(--font-display)" }}>{col.label}</span>
                  <span className="ml-auto text-[9px] px-1 rounded-full" style={{ background: c.line, color: c.ink4, fontFamily: "var(--font-mono)" }}>{col.cards.length}</span>
                </motion.div>
                <div className="space-y-1.5">
                  {col.cards.map((card, ii) => (
                    <motion.div key={ii} className="p-2.5 rounded-lg"
                      style={{ background: c.bg, border: `1px solid ${c.line}` }}
                      initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.42 + ci * 0.07 + ii * 0.05 }}
                      whileHover={{ y: -1.5, borderColor: c.accentBd }}>
                      <p className="text-[10px] font-medium mb-1.5 leading-snug" style={{ color: c.ink }}>{card.t}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ color: TAG_CLR[card.tag] ?? c.accent, background: `${TAG_CLR[card.tag] ?? c.accent}18`, fontFamily: "var(--font-mono)" }}>
                        {card.tag}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ c, dark }: { c: Theme; dark: boolean }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 260], [1, 0]);
  const yParallax = useTransform(scrollY, [0, 400], [0, -48]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 px-5 sm:px-8 overflow-hidden"
      style={{ background: dark ? `linear-gradient(150deg, #0f0d0b 0%, #1a1310 55%, #0f0d0b 100%)` : `linear-gradient(150deg, #f5ede0 0%, #ede2d0 55%, #f5ede0 100%)` }}>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${dark ? "rgba(232,224,213,0.055)" : "rgba(26,18,8,0.07)"} 1px, transparent 1px)`,
        backgroundSize: "26px 26px",
      }} />

      {/* Accent glow */}
      <motion.div className="absolute pointer-events-none" style={{ y: yParallax,
        top: "8%", left: "28%", width: "580px", height: "580px",
        background: `radial-gradient(ellipse, ${c.accentBg} 0%, transparent 68%)`,
        filter: "blur(52px)" }} />
      <motion.div className="absolute pointer-events-none"
        style={{ bottom: "15%", right: "8%", width: "340px", height: "340px",
          background: dark ? "radial-gradient(ellipse, rgba(99,60,20,0.15) 0%, transparent 65%)" : "radial-gradient(ellipse, rgba(192,56,0,0.06) 0%, transparent 65%)",
          filter: "blur(44px)" }} />

      <motion.div className="relative z-10 max-w-6xl mx-auto w-full" style={{ opacity }}>
        {/* Label */}
        <motion.div className="mb-10 flex"
          initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SP, delay: 0.06 }}>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full"
            style={{ color: c.accent, background: c.accentBg, border: `1px solid ${c.accentBd}`, letterSpacing: "0.09em", fontFamily: "var(--font-mono)" }}>
            <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }}
              animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 2.4 }} />
            OPEN BETA
          </span>
        </motion.div>

        {/* Headline — Bricolage Grotesque */}
        <h1 className="mb-8"
          style={{ fontSize: "clamp(50px, 7vw, 96px)", letterSpacing: "-0.048em", lineHeight: "1.01",
            fontFamily: "var(--font-display)", fontWeight: 800, color: c.ink }}>
          <AnimWords text="Your team." delay={0.1} c={c} />
          <br />
          <AnimWords text="One workspace." delay={0.28} c={c} />
          <br />
          <motion.span style={{ color: c.accent, fontStyle: "italic", fontWeight: 700 }}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.6 }}>
            No chaos.
          </motion.span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <motion.p className="text-[17px] leading-[1.78] mb-9" style={{ color: c.ink2, maxWidth: "44ch" }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.68 }}>
              Kanban boards, real-time docs, team presence, and sprint analytics —
              all wired together. Built for developers and teams who actually ship.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.78 }}>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: c.accent, boxShadow: `0 0 28px ${c.accentBg}` }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm"
                  style={{ color: c.ink3, border: `1px solid ${c.lineHi}` }}>
                  Sign in
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP_SLOW, delay: 0.3 }}>
            <KanbanPreview c={c} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

const FEATS = [
  { Icon: LayoutGrid, n: "01", title: "Kanban board",      desc: "Drag-and-drop with live sync. Every move is visible to your whole team instantly." },
  { Icon: Users,      n: "02", title: "Live presence",     desc: "See who's online and what they're editing. Typing indicators on every thread." },
  { Icon: FileText,   n: "03", title: "Shared docs",       desc: "Specs and runbooks that update in real time. No more copy-pasting between tabs." },
  { Icon: BarChart3,  n: "04", title: "Sprint analytics",  desc: "Velocity, cycle time, bottlenecks. Know where your sprint goes wrong before it does." },
  { Icon: Plug,       n: "05", title: "Integrations",      desc: "GitHub, Slack, Discord. Your task activity flows into the tools you already use." },
  { Icon: Zap,        n: "06", title: "AI assistant",      desc: "One click turns a task title into a complete description. Gemini handles the grunt work." },
];

function Features({ c }: { c: Theme }) {
  return (
    <section id="features" className="py-24 px-5 sm:px-8"
      style={{ background: c.bg2, borderTop: `1px solid ${c.line}` }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: c.accent, fontFamily: "var(--font-mono)" }}>
            Capabilities
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 58px)", letterSpacing: "-0.042em", lineHeight: 1.1,
            fontFamily: "var(--font-display)", fontWeight: 800, color: c.ink }}>
            Everything your team needs.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{ background: c.lineHi }}>
          {FEATS.map(({ Icon, n, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.055}>
              <motion.div className="p-7 h-full" style={{ background: c.bg2 }}
                whileHover={{ background: c.bg3 }} transition={{ duration: 0.18 }}>
                <div className="flex gap-4 items-start">
                  <span className="text-[10px] font-bold shrink-0 mt-1"
                    style={{ color: c.ink4, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>{n}</span>
                  <div>
                    <motion.div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: c.accentBg, border: `1px solid ${c.accentBd}` }}
                      whileHover={{ scale: 1.14, rotate: 7 }} transition={SP}>
                      <Icon size={15} style={{ color: c.accent }} />
                    </motion.div>
                    <h3 className="font-bold mb-2" style={{ fontSize: "14px", letterSpacing: "-0.025em",
                      color: c.ink, fontFamily: "var(--font-display)" }}>{title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: c.ink3 }}>{desc}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Open a workspace",      body: "Name it, pick a color, invite your team. You're live in under a minute." },
  { n: "02", title: "Build the board",       body: "Add tasks, set priorities, assign teammates. Drag between columns as work progresses." },
  { n: "03", title: "Work together, live",   body: "Every change is instant. Comments thread to tasks. Docs update as you type." },
  { n: "04", title: "See where time goes",   body: "Velocity, cycle time, blockers — all in one view. Ship without the post-mortem surprises." },
];

function HowItWorks({ c }: { c: Theme }) {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ background: c.bg, borderTop: `1px solid ${c.line}` }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: c.accent, fontFamily: "var(--font-mono)" }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 58px)", letterSpacing: "-0.042em", lineHeight: 1.1,
            fontFamily: "var(--font-display)", fontWeight: 800, color: c.ink }}>
            From zero to shipping.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: c.lineHi, border: `1px solid ${c.line}` }}>
          {STEPS.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 0.08}>
              <motion.div className="p-7 h-full relative overflow-hidden group"
                style={{ background: c.bg }}
                whileHover={{ background: c.bg2 }} transition={{ duration: 0.18 }}>
                {/* Big background number */}
                <div className="absolute -top-4 -right-2 select-none pointer-events-none"
                  style={{ fontSize: "clamp(80px, 10vw, 120px)", fontFamily: "var(--font-display)",
                    fontWeight: 800, color: c.accentBg, letterSpacing: "-0.06em", lineHeight: 1 }}>
                  {n}
                </div>
                {/* Foreground content */}
                <div className="relative z-10">
                  <p className="text-[11px] font-bold mb-5" style={{ color: c.accent, fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
                    STEP {n}
                  </p>
                  <h3 className="font-bold mb-3" style={{ fontSize: "16px", letterSpacing: "-0.03em",
                    color: c.ink, fontFamily: "var(--font-display)", lineHeight: 1.25 }}>
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: c.ink3 }}>{body}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA({ c }: { c: Theme }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <section className="py-24 px-5 sm:px-8" style={{ background: c.bg2, borderTop: `1px solid ${c.line}` }}>
      <div className="max-w-5xl mx-auto" ref={ref}>
        <motion.div className="rounded-2xl overflow-hidden relative"
          style={{ border: `1px solid ${c.accentBd}`, background: c.bg3 }}
          initial={{ opacity: 0, scale: 0.97 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={SP_SLOW}>
          {/* Glow */}
          <motion.div className="absolute top-0 right-0 pointer-events-none"
            style={{ width: "380px", height: "380px",
              background: `radial-gradient(circle, ${c.accentBg} 0%, transparent 68%)`,
              filter: "blur(40px)" }}
            animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 5 }} />

          <div className="relative z-10 px-10 py-20 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-5"
              style={{ color: c.accent, fontFamily: "var(--font-mono)" }}>
              Ready to ship?
            </p>
            <h2 className="mb-4" style={{ fontSize: "clamp(32px, 5vw, 62px)",
              fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.045em", color: c.ink, lineHeight: 1.05 }}>
              Your team is{" "}
              <motion.span className="italic" style={{ color: c.accent }}
                animate={{ opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 3 }}>
                waiting.
              </motion.span>
            </h2>
            <p className="text-[15px] mb-10 mx-auto" style={{ color: c.ink2, maxWidth: "38ch", lineHeight: 1.72 }}>
              Free to start. No credit card. Set up in two minutes.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: c.accent, boxShadow: `0 0 32px ${c.accentBg}` }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm"
                  style={{ color: c.ink3, border: `1px solid ${c.lineHi}` }}>
                  Sign in
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer({ c }: { c: Theme }) {
  return (
    <footer style={{ background: c.bg, borderTop: `1px solid ${c.line}` }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2" style={{ color: c.accent }}>
            <Logo size={16} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "-0.025em", color: c.ink }}>
              WorkspaceFlow
            </span>
          </div>
          <p className="text-[12px]" style={{ color: c.ink4 }}>Real-time project management for teams who ship.</p>
        </div>
        <div className="flex items-center gap-5">
          <a href="https://github.com/thribhuvan003/workspace-flow" target="_blank" rel="noopener noreferrer"
            className="text-[12px] transition-colors" style={{ color: c.ink4, fontFamily: "var(--font-mono)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.ink4)}>
            GitHub ↗
          </a>
          <span className="text-[11px]" style={{ color: c.ink4, fontFamily: "var(--font-mono)" }}>v1.0</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [dark, setDark] = useState(true);
  const c = dark ? DARK : LIGHT;

  return (
    <main style={{ background: c.bg, minHeight: "100vh", transition: "background 0.3s ease" }}>
      <Navbar c={c} dark={dark} onToggle={() => setDark((d) => !d)} />
      <Hero c={c} dark={dark} />
      <Features c={c} />
      <HowItWorks c={c} />
      <CTA c={c} />
      <Footer c={c} />
    </main>
  );
}
