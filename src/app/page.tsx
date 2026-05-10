"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, LayoutGrid, Users, BarChart3, FileText, Zap, Plug } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 280, damping: 28 };
const SPRING_SLOW = { type: "spring" as const, stiffness: 120, damping: 20 };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function AnimWords({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} className="inline-block" style={{ marginRight: "0.22em" }}
          initial={{ opacity: 0, y: 28, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING, delay: delay + i * 0.065 }}>
          {w}
        </motion.span>
      ))}
    </>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SPRING, delay }}>
      {children}
    </motion.div>
  );
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2.5" fill="#2dd4bf" />
      <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.45" />
      <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.45" />
      <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.18" />
    </svg>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 60], ["rgba(7,7,15,0)", "rgba(7,7,15,0.92)"]);
  const blur = useTransform(scrollY, [0, 60], [0, 16]);
  const border = useTransform(scrollY, [0, 60], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);

  return (
    <motion.header className="fixed top-0 inset-x-0 z-50"
      style={{ backdropFilter: `blur(${blur}px)` as unknown as string, WebkitBackdropFilter: `blur(${blur}px)` as unknown as string }}>
      <motion.div className="flex items-center justify-between h-14 px-6 sm:px-10 max-w-6xl mx-auto"
        style={{ background: bg as unknown as string, borderBottom: `1px solid ${border}` as unknown as string }}>

        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.1 }}>
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={18} />
            <span className="font-bold text-white text-[14px]" style={{ letterSpacing: "-0.03em" }}>WorkspaceFlow</span>
          </Link>
        </motion.div>

        <motion.div className="flex items-center gap-2"
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.15 }}>
          <Link href="/login"
            className="hidden sm:inline-flex text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: "rgba(240,240,248,0.45)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,240,248,0.45)")}>
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl text-[#030a09]"
              style={{ background: "#2dd4bf", boxShadow: "0 0 20px rgba(45,212,191,0.22)" }}>
              Get started <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

// ─── Kanban preview ────────────────────────────────────────────────────────────

const columns = [
  { id: "todo", label: "To Do", dot: "#4a4a6a",
    cards: [{ title: "Auth flow redesign", tag: "Design" }, { title: "Rate limiting", tag: "Backend" }] },
  { id: "prog", label: "In Progress", dot: "#2dd4bf",
    cards: [{ title: "Kanban drag & drop", tag: "Feature" }, { title: "Socket.io rooms", tag: "Backend" }, { title: "Mobile layout", tag: "Frontend" }] },
  { id: "review", label: "Review", dot: "#f59e0b",
    cards: [{ title: "Analytics v1", tag: "Feature" }, { title: "Invite emails", tag: "Backend" }] },
  { id: "done", label: "Done", dot: "#22c55e",
    cards: [{ title: "NextAuth v5 setup", tag: "Security" }, { title: "Prisma schema", tag: "Backend" }] },
];
const tagColors: Record<string, string> = { Design: "#a78bfa", Backend: "#60a5fa", Frontend: "#f472b6", Feature: "#2dd4bf", Security: "#fb923c" };

function KanbanPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#06060f" }}
      initial={{ opacity: 0, y: 48, scale: 0.97 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ ...SPRING_SLOW, delay: 0.1 }}>
      {/* Chrome */}
      <div className="flex items-center gap-1.5 px-4 h-9"
        style={{ background: "#0a0a18", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
          <motion.span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.6 }}
            initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ delay: 0.3 + i * 0.06, type: "spring" as const, stiffness: 400 }} />
        ))}
        <div className="ml-3 px-2 h-5 rounded flex items-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", minWidth: 150 }}>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>app.workspaceflow.io/board</span>
        </div>
      </div>
      <div className="flex">
        {/* Mini sidebar */}
        <div className="w-9 flex flex-col items-center pt-3 gap-3 shrink-0"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          {[LayoutGrid, FileText, Users, BarChart3].map((Icon, i) => (
            <motion.div key={i} className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: i === 0 ? "rgba(45,212,191,0.1)" : "transparent", color: i === 0 ? "#2dd4bf" : "rgba(255,255,255,0.18)" }}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.4 + i * 0.07 }}>
              <Icon size={11} />
            </motion.div>
          ))}
        </div>
        {/* Board */}
        <div className="flex-1 overflow-x-auto p-3">
          <div className="flex gap-2 min-w-max">
            {columns.map((col, ci) => (
              <div key={col.id} className="w-[152px] shrink-0">
                <motion.div className="flex items-center gap-1.5 mb-2 px-0.5"
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 + ci * 0.07 }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(240,240,248,0.65)" }}>{col.label}</span>
                  <span className="ml-auto text-[9px] px-1 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.28)" }}>{col.cards.length}</span>
                </motion.div>
                <div className="space-y-1.5">
                  {col.cards.map((card, ii) => (
                    <motion.div key={ii} className="p-2.5 rounded-lg"
                      style={{ background: "#0e0e1f", border: "1px solid rgba(255,255,255,0.06)" }}
                      initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.45 + ci * 0.07 + ii * 0.05 }}
                      whileHover={{ y: -1, borderColor: "rgba(45,212,191,0.2)" }}>
                      <p className="text-[10px] font-medium mb-1.5 leading-snug" style={{ color: "rgba(240,240,248,0.82)" }}>{card.title}</p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ color: tagColors[card.tag] ?? "#2dd4bf", background: `${tagColors[card.tag] ?? "#2dd4bf"}18` }}>
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

function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 280], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, -50]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 px-6 sm:px-10 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #07070f 0%, #090916 55%, #07080f 100%)" }}>
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      {/* Glow */}
      <motion.div className="absolute pointer-events-none" style={{ y,
        top: "5%", left: "30%", width: "640px", height: "640px",
        background: "radial-gradient(ellipse, rgba(45,212,191,0.055) 0%, transparent 65%)",
        filter: "blur(48px)",
      }} />
      <motion.div className="absolute pointer-events-none"
        style={{ bottom: "10%", right: "5%", width: "400px", height: "400px",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.04) 0%, transparent 65%)",
          filter: "blur(48px)" }} />

      <motion.div className="relative z-10 max-w-6xl mx-auto w-full" style={{ opacity }}>
        {/* Beta pill */}
        <motion.div className="mb-10 flex"
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...SPRING, delay: 0.08 }}>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full"
            style={{ color: "#2dd4bf", background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.18)", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
            <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2dd4bf" }}
              animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} />
            OPEN BETA
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-white mb-7"
          style={{ fontSize: "clamp(48px, 6.5vw, 92px)", letterSpacing: "-0.045em", lineHeight: "1.03", fontFamily: "var(--font-serif)", fontWeight: 400 }}>
          <AnimWords text="Your team." delay={0.12} />
          <br />
          <AnimWords text="One workspace." delay={0.3} />
          <br />
          <motion.span className="italic" style={{ color: "#2dd4bf" }}
            initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.62 }}>
            No chaos.
          </motion.span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <motion.p className="text-[17px] leading-[1.75] mb-9"
              style={{ color: "rgba(240,240,248,0.44)", maxWidth: "46ch" }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.72 }}>
              Kanban boards, real-time docs, team presence, and sprint analytics —
              all in one place. Built for teams who ship.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.82 }}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-[#030a09]"
                  style={{ background: "#2dd4bf", boxShadow: "0 0 32px rgba(45,212,191,0.28)" }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm"
                  style={{ color: "rgba(240,240,248,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Sign in
                </Link>
              </motion.div>
            </motion.div>
          </div>
          <KanbanPreview />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

const features = [
  { icon: LayoutGrid, n: "01", title: "Kanban board", desc: "Drag-and-drop columns with live sync. Everyone sees moves as they happen." },
  { icon: Users,      n: "02", title: "Live presence",  desc: "See who's online, what they're editing, and typing indicators on every comment." },
  { icon: FileText,   n: "03", title: "Shared docs",    desc: "Write specs and runbooks that update in real time — no Google Docs tab-switching." },
  { icon: BarChart3,  n: "04", title: "Analytics",      desc: "Velocity, cycle time, and bottleneck detection. Know where sprints go wrong." },
  { icon: Plug,       n: "05", title: "Integrations",   desc: "GitHub, Slack, Discord. Pipe task activity into the tools your team already uses." },
  { icon: Zap,        n: "06", title: "AI assistant",   desc: "One click turns a task title into a full description. Gemini does the grunt work." },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 sm:px-10"
      style={{ background: "linear-gradient(180deg, #09091a 0%, #07070f 100%)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4"
            style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>Capabilities</p>
          <h2 style={{ fontSize: "clamp(34px, 4.5vw, 60px)", letterSpacing: "-0.04em", lineHeight: 1.1, fontFamily: "var(--font-serif)", fontWeight: 400, color: "#f0f0f8" }}>
            Everything your team needs.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          {features.map(({ icon: Icon, n, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.055}>
              <motion.div className="p-7 h-full"
                style={{ background: "#08081a" }}
                whileHover={{ background: "#0d0d22" }}>
                <div className="flex gap-4 items-start">
                  <span className="text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ color: "rgba(240,240,248,0.18)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>{n}</span>
                  <div>
                    <motion.div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.12)" }}
                      whileHover={{ scale: 1.12, rotate: 6 }} transition={SPRING}>
                      <Icon size={15} style={{ color: "#2dd4bf" }} />
                    </motion.div>
                    <h3 className="font-semibold mb-2 text-white" style={{ fontSize: "14px", letterSpacing: "-0.02em" }}>{title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(240,240,248,0.38)" }}>{desc}</p>
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

const steps = [
  { n: "01", title: "Open a workspace", body: "Name it, pick a color, invite your team. You're live in under a minute." },
  { n: "02", title: "Build your board",  body: "Add tasks, set priorities, assign teammates. Drag between columns as work moves forward." },
  { n: "03", title: "Work together, live", body: "Every change is instant. Comments thread to tasks. Docs update as you type." },
  { n: "04", title: "See where time goes", body: "Velocity, cycle time, and blockers — all visible. Ship without the post-mortem surprises." },
];

function HowItWorks() {
  return (
    <section className="py-28 px-6 sm:px-10"
      style={{ background: "#07070f", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4"
            style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>How it works</p>
          <h2 style={{ fontSize: "clamp(34px, 4.5vw, 60px)", letterSpacing: "-0.04em", lineHeight: 1.1, fontFamily: "var(--font-serif)", fontWeight: 400, color: "#f0f0f8" }}>
            From zero to shipping.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {steps.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 0.08}>
              <motion.div className="p-8" style={{ background: "#07070f" }} whileHover={{ background: "#0c0c1c" }}>
                <div className="text-[56px] font-bold mb-5 leading-none"
                  style={{ color: "rgba(45,212,191,0.12)", fontFamily: "var(--font-serif)", letterSpacing: "-0.05em" }}>{n}</div>
                <h3 className="text-white mb-2.5" style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.025em" }}>{title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(240,240,248,0.38)" }}>{body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section className="py-28 px-6 sm:px-10"
      style={{ background: "linear-gradient(180deg, #09091a 0%, #07070f 100%)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0c1e1b 0%, #0a0a18 100%)", border: "1px solid rgba(45,212,191,0.18)" }}
          initial={{ opacity: 0, scale: 0.97 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={SPRING_SLOW}>
          {/* Glow */}
          <motion.div className="absolute pointer-events-none"
            style={{ top: "-30%", right: "10%", width: "350px", height: "350px",
              background: "radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 65%)", filter: "blur(32px)" }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 5 }} />
          <div className="relative z-10 px-10 py-20 text-center">
            <h2 className="text-white mb-5"
              style={{ fontSize: "clamp(34px, 4.5vw, 64px)", fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.04em" }}>
              Your team is <span className="italic" style={{ color: "#2dd4bf" }}>waiting.</span>
            </h2>
            <p className="text-[15px] mb-10 mx-auto" style={{ color: "rgba(240,240,248,0.38)", maxWidth: "40ch", lineHeight: 1.7 }}>
              Free to start. No credit card. Takes two minutes to set up.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-[#030a09]"
                  style={{ background: "#2dd4bf", boxShadow: "0 0 36px rgba(45,212,191,0.3)" }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm"
                  style={{ color: "rgba(240,240,248,0.48)", border: "1px solid rgba(255,255,255,0.1)" }}>
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

function Footer() {
  return (
    <footer style={{ background: "#07070f", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Wordmark */}
        <div className="pt-12 pb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="select-none" style={{
            fontSize: "clamp(52px, 9vw, 108px)", letterSpacing: "-0.065em",
            color: "rgba(255,255,255,0.035)", fontFamily: "var(--font-serif)", fontWeight: 700, lineHeight: 1,
          }}>workspaceflow</span>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 py-8">
          <div className="flex items-center gap-2.5">
            <Logo size={16} />
            <span className="text-[13px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>WorkspaceFlow</span>
            <span className="text-[13px]" style={{ color: "rgba(240,240,248,0.22)" }}>— Real-time project management.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/thribhuvan003/workspace-flow" target="_blank" rel="noopener noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: "rgba(240,240,248,0.3)", fontFamily: "var(--font-mono)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0f8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,240,248,0.3)")}>
              GitHub
            </a>
            <span className="text-[11px]" style={{ color: "rgba(240,240,248,0.15)", fontFamily: "var(--font-mono)" }}>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ background: "#07070f" }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
