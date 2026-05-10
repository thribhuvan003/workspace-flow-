"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, LayoutGrid, Users, BarChart3, FileText, Zap, Plug, Check } from "lucide-react";

// ─── Spring configs ────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 280, damping: 28 };
const SPRING_SLOW = { type: "spring" as const, stiffness: 120, damping: 20 };

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = () => {
      start += Math.ceil((to - start) / 8);
      setVal(start >= to ? to : start);
      if (start < to) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Word-by-word stagger ──────────────────────────────────────────────────────

function AnimWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 32, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...SPRING, delay: delay + i * 0.06 }}
          style={{ marginRight: "0.25em" }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Section reveal ────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Logo mark ─────────────────────────────────────────────────────────────────

function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2.5" fill="#2dd4bf" />
      <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.5" />
      <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.5" />
      <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#2dd4bf" opacity="0.2" />
    </svg>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 80], [0, 14]);
  const bg = useTransform(scrollY, [0, 80], ["rgba(6,6,9,0)", "rgba(6,6,9,0.9)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 px-5 sm:px-8"
      style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` } as React.CSSProperties}
    >
      <motion.div
        className="max-w-6xl mx-auto mt-4 rounded-2xl flex items-center justify-between h-14 px-5"
        style={{ background: bg as any, borderColor: borderOpacity as any, borderWidth: "1px", borderStyle: "solid" } as React.CSSProperties}
      >
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.1 }}>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={20} />
            <span className="font-bold text-white text-[15px]" style={{ letterSpacing: "-0.025em", fontFamily: "var(--font-sans)" }}>
              WorkspaceFlow
            </span>
          </Link>
        </motion.div>

        <motion.nav
          className="hidden md:flex items-center gap-7"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
        >
          {["Features", "Pricing", "Changelog"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[13px] font-medium transition-colors"
              style={{ color: "rgba(240,240,248,0.45)" }}
              whileHover={{ color: "#f0f0f8" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              {item}
            </motion.a>
          ))}
        </motion.nav>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING, delay: 0.2 }}
        >
          <Link
            href="/login"
            className="hidden sm:inline-flex text-[13px] font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ color: "rgba(240,240,248,0.5)" }}
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl text-[#020608]"
              style={{ background: "#2dd4bf" }}
            >
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
  { id: "todo", label: "To Do", dot: "#5a5a7a", cards: [{ title: "Redesign onboarding", tag: "Design" }, { title: "API rate limiting", tag: "Backend" }] },
  { id: "progress", label: "In Progress", dot: "#2dd4bf", cards: [{ title: "Kanban drag & drop", tag: "Feature" }, { title: "Real-time sync", tag: "Backend" }, { title: "Mobile responsive", tag: "Frontend" }] },
  { id: "review", label: "Review", dot: "#f59e0b", cards: [{ title: "Payment integration", tag: "Billing" }, { title: "Analytics v1", tag: "Feature" }] },
  { id: "done", label: "Done", dot: "#22c55e", cards: [{ title: "Auth with NextAuth v5", tag: "Security" }, { title: "Team invite emails", tag: "Backend" }] },
];
const tagColors: Record<string, string> = { Design: "#a78bfa", Backend: "#60a5fa", Frontend: "#f472b6", Feature: "#2dd4bf", Billing: "#34d399", Security: "#fb923c" };

function KanbanPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ ...SPRING_SLOW, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#08080e" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 h-9" style={{ background: "#0c0c15", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
          <motion.span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.65 }}
            initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ delay: 0.3 + i * 0.06, type: "spring" as const, stiffness: 400 }} />
        ))}
        <div className="ml-3 flex items-center px-2 h-5 rounded-md" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", minWidth: 160 }}>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>app.workspaceflow.io/board</span>
        </div>
      </div>

      <div className="flex">
        <div className="w-10 flex flex-col items-center pt-3 gap-3 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          {[LayoutGrid, FileText, Users, BarChart3].map((Icon, i) => (
            <motion.div key={i} className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: i === 0 ? "rgba(45,212,191,0.12)" : "transparent", color: i === 0 ? "#2dd4bf" : "rgba(255,255,255,0.2)" }}
              initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.07 }}>
              <Icon size={12} />
            </motion.div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto p-3">
          <div className="flex gap-2.5 min-w-max">
            {columns.map((col, ci) => (
              <div key={col.id} className="w-[168px] shrink-0">
                <motion.div className="flex items-center gap-1.5 mb-2 px-1"
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 + ci * 0.08 }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                  <span className="text-[11px] font-semibold" style={{ color: "rgba(240,240,248,0.7)" }}>{col.label}</span>
                  <span className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>{col.cards.length}</span>
                </motion.div>
                <div className="space-y-1.5">
                  {col.cards.map((card, ii) => (
                    <motion.div key={ii} className="p-2.5 rounded-lg" style={{ background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.06)" }}
                      initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45 + ci * 0.08 + ii * 0.05 }}
                      whileHover={{ y: -2, borderColor: "rgba(45,212,191,0.25)" }}>
                      <p className="text-[11px] font-medium mb-1.5 leading-snug" style={{ color: "rgba(240,240,248,0.85)" }}>{card.title}</p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: tagColors[card.tag] ?? "#2dd4bf", background: `${tagColors[card.tag] ?? "#2dd4bf"}18` }}>{card.tag}</span>
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
  const y = useTransform(scrollY, [0, 500], [0, -60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 px-5 sm:px-8 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      {/* Teal glow */}
      <motion.div className="absolute pointer-events-none" style={{ y, top: "10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 65%)", filter: "blur(40px)" }} />

      <motion.div className="relative z-10 max-w-6xl mx-auto w-full" style={{ opacity }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="mb-8 flex"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ color: "#2dd4bf", background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", letterSpacing: "0.07em", fontFamily: "var(--font-mono)" }}>
            <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2dd4bf" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            NOW IN PUBLIC BETA
          </span>
        </motion.div>

        {/* Headline — editorial left-aligned, Instrument Serif */}
        <div className="mb-8">
          <h1 className="font-extrabold text-white" style={{ fontSize: "clamp(52px, 7vw, 96px)", letterSpacing: "-0.045em", lineHeight: "1.02", fontFamily: "var(--font-serif)" }}>
            <AnimWords text="Your team." delay={0.15} />
            <br />
            <AnimWords text="One workspace." delay={0.35} />
            <br />
            <motion.span
              className="italic"
              style={{ color: "#2dd4bf", fontFamily: "var(--font-serif)" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.65 }}
            >
              No chaos.
            </motion.span>
          </h1>
        </div>

        {/* Two-col layout below headline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.75 }}
              className="text-lg leading-relaxed mb-8"
              style={{ color: "rgba(240,240,248,0.48)", maxWidth: "48ch" }}
            >
              WorkspaceFlow combines Kanban boards, real-time collaboration,
              team docs, and sprint analytics — everything your team needs to
              ship faster without the context-switching.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.85 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[#020608] text-sm"
                  style={{ background: "#2dd4bf", boxShadow: "0 0 28px rgba(45,212,191,0.3)" }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ color: "rgba(240,240,248,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Sign in
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats row — Tray-inspired */}
            <motion.div
              className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.95 }}
            >
              {[["3", "Role portals"], ["UPI", "Payments"], ["OTP", "Verified pickup"]].map(([num, lbl], i) => (
                <motion.div key={lbl} className="px-5 py-4" style={{ background: "#09090f" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 + i * 0.08 }}>
                  <div className="text-2xl font-extrabold text-white mb-0.5" style={{ letterSpacing: "-0.04em", fontFamily: "var(--font-serif)" }}>{num}</div>
                  <div className="text-xs" style={{ color: "rgba(240,240,248,0.38)", fontFamily: "var(--font-mono)" }}>{lbl}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Kanban preview */}
          <div>
            <KanbanPreview />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

const features = [
  { icon: LayoutGrid, num: "01", title: "Visual Kanban boards", desc: "Drag, drop, and ship. Customisable columns, priority flags, and assignees built for real teams." },
  { icon: Users, num: "02", title: "Real-time presence", desc: "See exactly where teammates are and what they're editing. No stale data, no overwrite collisions." },
  { icon: FileText, num: "03", title: "Team documentation", desc: "Specs, runbooks, and wikis — versioned, searchable, linked directly to tasks." },
  { icon: BarChart3, num: "04", title: "Sprint analytics", desc: "Cycle time, velocity, and bottleneck detection. Know why sprints slip before they slip." },
  { icon: Plug, num: "05", title: "Native integrations", desc: "GitHub, Slack, Zapier, and a full REST API. Plug into the stack you already have." },
  { icon: Zap, num: "06", title: "AI task assistant", desc: "Describe a feature in plain English. Get a structured breakdown ready for the board." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>
            02 &mdash; Capabilities
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.04em", fontFamily: "var(--font-serif)", fontWeight: 400 }}>
            What it does.
          </h2>
        </Reveal>

        {/* Gap-px grid like Tray portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          {features.map(({ icon: Icon, num, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <motion.div
                className="group p-8 h-full"
                style={{ background: "#06060a" }}
                whileHover={{ background: "#0d0d18" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-5">
                  <span className="text-[11px] font-bold pt-0.5 shrink-0" style={{ color: "rgba(240,240,248,0.2)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>{num}</span>
                  <div>
                    <motion.div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.12)" }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={SPRING}
                    >
                      <Icon size={16} style={{ color: "#2dd4bf" }} />
                    </motion.div>
                    <h3 className="font-semibold text-white mb-2" style={{ fontSize: "15px", letterSpacing: "-0.02em" }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(240,240,248,0.4)" }}>{desc}</p>
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

// ─── How it works (Tray-style numbered steps) ──────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "01", title: "Create a workspace.", body: "Name it, pick a colour, invite your team. Done in under a minute." },
    { n: "02", title: "Add tasks to the board.", body: "Drag items across columns. Assign, prioritise, and set due dates." },
    { n: "03", title: "Collaborate in real time.", body: "Everyone sees changes live. Comments, docs, and threads stay attached to tasks." },
    { n: "04", title: "Track and ship.", body: "Analytics show you velocity, bottlenecks, and what's slowing your sprint." },
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>
            03 &mdash; Flow
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.04em", fontFamily: "var(--font-serif)", fontWeight: 400 }}>
            How it works.
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {steps.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 0.08}>
              <motion.div className="p-8" style={{ background: "#06060a" }} whileHover={{ background: "#0d0d18" }}>
                <div className="text-5xl font-bold mb-6 leading-none" style={{ color: "rgba(240,240,248,0.1)", fontFamily: "var(--font-serif)", letterSpacing: "-0.05em" }}>{n}</div>
                <h3 className="font-semibold text-white mb-3" style={{ fontSize: "16px", letterSpacing: "-0.02em", fontFamily: "var(--font-serif)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(240,240,248,0.38)" }}>{body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonial ───────────────────────────────────────────────────────────────

function Testimonial() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-4xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ ...SPRING_SLOW }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-12" style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>
            04 &mdash; What teams say
          </p>
          <blockquote className="text-white mb-10" style={{ fontSize: "clamp(28px, 4vw, 52px)", fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.035em", lineHeight: "1.15" }}>
            <motion.span
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
            >
              &ldquo;WorkspaceFlow replaced four tools for us.
            </motion.span>
            {" "}
            <motion.span
              className="italic" style={{ color: "#2dd4bf" }}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 }}
            >
              We shipped 3&times; faster
            </motion.span>
            {" "}
            <motion.span
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
            >
              in the first month.&rdquo;
            </motion.span>
          </blockquote>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ ...SPRING, delay: 0.6 }}
          >
            <div className="flex -space-x-2">
              {([ ["#2dd4bf","S"], ["#60a5fa","M"], ["#a78bfa","A"] ] as [string,string][]).map(([c,l],i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ background: c, borderColor: "#060609", zIndex: 3-i }}>{l}</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sarah K.</p>
              <p className="text-xs" style={{ color: "rgba(240,240,248,0.35)", fontFamily: "var(--font-mono)" }}>Engineering Lead, Axiom Labs</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────

const freePlan = ["3 workspaces", "Unlimited tasks & boards", "5 members per workspace", "1 GB storage", "Basic analytics"];
const proPlan = ["Unlimited workspaces", "Unlimited team members", "Real-time presence & live cursors", "Advanced analytics", "AI task assistant", "Custom integrations + REST API", "25 GB storage", "Priority support"];

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>
            05 &mdash; Pricing
          </p>
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.04em", fontFamily: "var(--font-serif)", fontWeight: 400 }}>
            Simple. Honest.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          <Reveal>
            <motion.div className="p-8 rounded-2xl h-full" style={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.07)" }} whileHover={{ y: -4 }} transition={SPRING}>
              <p className="text-sm font-semibold mb-2" style={{ color: "rgba(240,240,248,0.4)", fontFamily: "var(--font-mono)" }}>FREE</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold text-white" style={{ letterSpacing: "-0.05em", fontFamily: "var(--font-serif)" }}>$0</span>
                <span className="text-sm mb-2" style={{ color: "rgba(240,240,248,0.3)" }}>/ forever</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "rgba(240,240,248,0.35)" }}>Everything to get started.</p>
              <Link href="/register" className="block text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-all" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,240,248,0.7)" }}>
                Create free account
              </Link>
              <ul className="space-y-3">
                {freePlan.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(240,240,248,0.45)" }}>
                    <Check size={13} style={{ color: "rgba(45,212,191,0.55)" }} />{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          <Reveal delay={0.08}>
            <motion.div className="p-8 rounded-2xl h-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1e1b 0%, #0d0d16 100%)", border: "1px solid rgba(45,212,191,0.22)" }} whileHover={{ y: -4 }} transition={SPRING}>
              <motion.div className="absolute top-0 right-0 w-56 h-56 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)", filter: "blur(24px)" }}
                animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold" style={{ color: "rgba(240,240,248,0.6)", fontFamily: "var(--font-mono)" }}>PRO</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(45,212,191,0.1)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.18)", letterSpacing: "0.08em" }}>POPULAR</span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-white" style={{ letterSpacing: "-0.05em", fontFamily: "var(--font-serif)" }}>$12</span>
                  <span className="text-sm mb-2" style={{ color: "rgba(240,240,248,0.3)" }}>/ seat / month</span>
                </div>
                <p className="text-sm mb-8" style={{ color: "rgba(240,240,248,0.35)" }}>Annual billing, or $15/mo monthly.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/register" className="block text-center py-3 rounded-xl font-semibold text-sm text-[#020608] mb-8" style={{ background: "#2dd4bf", boxShadow: "0 0 24px rgba(45,212,191,0.25)" }}>
                    Start Pro trial — 14 days free
                  </Link>
                </motion.div>
                <ul className="space-y-3">
                  {proPlan.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(240,240,248,0.58)" }}>
                      <Check size={13} style={{ color: "#2dd4bf" }} />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </Reveal>
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
    <section className="py-24 px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          className="rounded-2xl p-px"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={SPRING_SLOW}
          style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.35), rgba(45,212,191,0.06))" }}
        >
          <div className="rounded-2xl px-10 py-16 text-center" style={{ background: "#09090f" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "#2dd4bf", fontFamily: "var(--font-mono)" }}>
              Ready to ship?
            </p>
            <h2 className="text-white mb-5" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.04em" }}>
              Your team is <span className="italic" style={{ color: "#2dd4bf" }}>waiting.</span>
            </h2>
            <p className="text-base mb-10 mx-auto" style={{ color: "rgba(240,240,248,0.4)", maxWidth: "42ch" }}>
              Join thousands of teams who stopped juggling tools and started shipping faster.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-[#020608]" style={{ background: "#2dd4bf", boxShadow: "0 0 32px rgba(45,212,191,0.32)" }}>
                  Start for free <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm" style={{ color: "rgba(240,240,248,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Sign in
                </Link>
              </motion.div>
            </div>
            <p className="mt-5 text-xs" style={{ color: "rgba(240,240,248,0.25)", fontFamily: "var(--font-mono)" }}>
              No credit card &nbsp;&middot;&nbsp; Free plan forever
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security"],
  };
  return (
    <footer className="px-5 sm:px-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Big wordmark */}
        <div className="py-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="font-bold select-none" style={{ fontSize: "clamp(60px, 10vw, 120px)", letterSpacing: "-0.06em", color: "rgba(255,255,255,0.04)", fontFamily: "var(--font-serif)" }}>
            workspaceflow
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4"><Logo size={18} /><span className="font-bold text-white text-sm" style={{ letterSpacing: "-0.02em" }}>WorkspaceFlow</span></div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(240,240,248,0.3)" }}>Real-time project management for teams who care about how they work.</p>
          </div>
          {Object.entries(links).map(([col, items]) => (
            <div key={col}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(240,240,248,0.22)", fontFamily: "var(--font-mono)" }}>{col}</p>
              <ul className="space-y-2.5">
                {items.map((item) => <li key={item}><a href="#" className="text-sm transition-colors" style={{ color: "rgba(240,240,248,0.4)" }}>{item}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs" style={{ color: "rgba(240,240,248,0.2)" }}>2025 WorkspaceFlow. All rights reserved.</p>
          <p className="text-xs" style={{ color: "rgba(240,240,248,0.15)", fontFamily: "var(--font-mono)" }}>v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-[#060609] min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonial />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
