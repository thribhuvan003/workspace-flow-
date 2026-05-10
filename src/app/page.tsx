"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Check,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  LayoutGrid,
  CreditCard,
  ArrowRight,
  Play,
} from "lucide-react";

// ─── Animation Variants ────────────────────────────────────────────────────────


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a3e]/60 backdrop-blur-xl"
      style={{ background: "rgba(10,10,15,0.85)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
            W
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">WorkspaceFlow</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="text-sm text-[#a0a0b0] hover:text-white transition-colors duration-200">
              {link}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="hidden sm:inline-flex text-sm text-[#a0a0b0] hover:text-white px-4 py-2 rounded-lg border border-[#2a2a3e] hover:border-[#6366f1]/50 transition-all duration-200">
            Sign in
          </Link>
          <Link href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/25"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Kanban Mockup ─────────────────────────────────────────────────────────────

const kanbanColumns = [
  {
    title: "Backlog",
    color: "#6b6b80",
    accent: "rgba(107,107,128,0.15)",
    cards: [
      { title: "User onboarding flow", tag: "Design", tagColor: "#a855f7", dots: ["#6366f1", "#a855f7"] },
      { title: "API rate limiting", tag: "Backend", tagColor: "#6366f1", dots: ["#22c55e"] },
      { title: "Mobile responsiveness", tag: "Frontend", tagColor: "#ec4899", dots: ["#f59e0b", "#6366f1"] },
    ],
  },
  {
    title: "In Progress",
    color: "#6366f1",
    accent: "rgba(99,102,241,0.12)",
    cards: [
      { title: "Kanban board drag & drop", tag: "Feature", tagColor: "#6366f1", dots: ["#6366f1", "#a855f7", "#ec4899"] },
      { title: "Real-time sync via WebSocket", tag: "Backend", tagColor: "#6366f1", dots: ["#22c55e"] },
      { title: "Dark mode polish", tag: "UI", tagColor: "#a855f7", dots: ["#f59e0b"] },
    ],
  },
  {
    title: "Review",
    color: "#f59e0b",
    accent: "rgba(245,158,11,0.10)",
    cards: [
      { title: "Payment integration", tag: "Billing", tagColor: "#22c55e", dots: ["#6366f1"] },
      { title: "Analytics dashboard v1", tag: "Feature", tagColor: "#6366f1", dots: ["#a855f7", "#ec4899"] },
      { title: "Docs editor improvements", tag: "Feature", tagColor: "#6366f1", dots: ["#f59e0b"] },
    ],
  },
  {
    title: "Done",
    color: "#22c55e",
    accent: "rgba(34,197,94,0.10)",
    cards: [
      { title: "Auth with NextAuth v5", tag: "Security", tagColor: "#22c55e", dots: ["#6366f1"] },
      { title: "Project creation wizard", tag: "Feature", tagColor: "#6366f1", dots: ["#a855f7"] },
      { title: "Team invitation emails", tag: "Backend", tagColor: "#6366f1", dots: ["#22c55e", "#f59e0b"] },
    ],
  },
];

function KanbanMockup() {
  return (
    <div className="relative w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max mx-auto px-4">
        {kanbanColumns.map((col) => (
          <div key={col.title} className="w-60 rounded-xl p-3 flex flex-col gap-3"
            style={{ background: col.accent, border: `1px solid ${col.color}30` }}>
            {/* Column header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-[13px] font-semibold text-white/90">{col.title}</span>
              </div>
              <span className="text-[11px] text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                {col.cards.length}
              </span>
            </div>

            {/* Cards */}
            {col.cards.map((card, i) => (
              <div key={i} className="rounded-lg p-3 cursor-pointer group hover:-translate-y-0.5 transition-transform duration-150"
                style={{ background: "#111118", border: "1px solid #2a2a3e" }}>
                <p className="text-[12px] text-white/80 font-medium leading-snug mb-2.5 group-hover:text-white transition-colors">
                  {card.title}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ color: card.tagColor, background: `${card.tagColor}18` }}>
                    {card.tag}
                  </span>
                  <div className="flex -space-x-1">
                    {card.dots.map((dot, j) => (
                      <span key={j} className="w-4 h-4 rounded-full border-2 border-[#111118]"
                        style={{ background: dot }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Add card button */}
            <button className="text-[11px] text-white/30 hover:text-white/60 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-all duration-150">
              + Add card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 50%, transparent 70%)",
          filter: "blur(40px)",
        }} />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 px-4 py-1.5 text-sm text-[#a5b4fc] mb-8">
          <Zap size={13} className="text-[#6366f1]" />
          Real-time · AI-powered · Open source
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          One workspace where your team{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            actually gets things done
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg text-[#a0a0b0] max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop jumping between Trello, Notion, Slack, and Google Docs. WorkspaceFlow combines
          Kanban, docs, chat, and analytics in one real-time workspace.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-[15px] border border-[#2a2a3e] bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#6366f1]/50 transition-all duration-200">
            <Play size={15} className="text-[#6366f1]" />
            View Demo
          </button>
        </motion.div>

        {/* Kanban mockup */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative">
          {/* Glow behind mockup */}
          <div className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(99,102,241,0.2) 0%, transparent 70%)",
              filter: "blur(20px)",
            }} />

          <div className="rounded-2xl overflow-hidden border border-[#2a2a3e]"
            style={{ background: "rgba(17,17,24,0.9)", boxShadow: "0 0 80px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.5)" }}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a3e]">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <span className="ml-4 text-[12px] text-[#6b6b80] flex-1 text-center">
                workspaceflow.app / projects / design-system
              </span>
            </div>
            <div className="p-6">
              <KanbanMockup />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: LayoutGrid,
    title: "Real-time Kanban Board",
    description: "Drag-and-drop task management with live updates, custom columns, and team assignments.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    icon: MessageSquare,
    title: "Live Comments & Chat",
    description: "Threaded discussions on every task with @mentions, emoji reactions, and instant notifications.",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
  },
  {
    icon: FileText,
    title: "Shared Docs",
    description: "Rich markdown editor with real-time collaboration, version history, and inline comments.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Invite members, set roles and permissions, manage multiple workspaces seamlessly.",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Velocity charts, burndown graphs, and productivity insights to keep projects on track.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    icon: CreditCard,
    title: "Simple Billing",
    description: "Transparent pricing with instant plan upgrades, payment history, and team billing.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16">
          <span className="inline-block text-[13px] font-semibold tracking-widest uppercase text-[#6366f1] mb-4">
            Everything you need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            All your tools in one place
          </h2>
          <p className="text-[#a0a0b0] text-lg max-w-xl mx-auto leading-relaxed">
            Replace six apps with one. WorkspaceFlow brings everything your team needs into a single, beautifully integrated workspace.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group rounded-2xl p-6 border border-[#2a2a3e] hover:border-[#3a3a52] transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{ background: "#111118", boxShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: f.bg, border: `1px solid ${f.color}30` }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="text-white font-semibold text-[16px] mb-2">{f.title}</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Create your workspace",
    description: "Sign up in seconds. Create a workspace for your team, invite members, and set roles — no credit card required.",
    color: "#6366f1",
  },
  {
    number: "02",
    title: "Set up your projects",
    description: "Build Kanban boards, start shared docs, and connect your team's chat channels. Everything is live and synced in real-time.",
    color: "#a855f7",
  },
  {
    number: "03",
    title: "Ship faster, together",
    description: "Track progress with analytics, celebrate wins, and keep every stakeholder in the loop — all from one dashboard.",
    color: "#ec4899",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16">
          <span className="inline-block text-[13px] font-semibold tracking-widest uppercase text-[#6366f1] mb-4">
            Simple by design
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            Up and running in minutes
          </h2>
          <p className="text-[#a0a0b0] text-lg max-w-xl mx-auto">
            No complex setup. No lengthy onboarding. Just create, invite, and start building.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px"
            style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }} />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center">
              {/* Number circle */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-6 z-10"
                style={{ background: "#111118", border: `2px solid ${step.color}`, boxShadow: `0 0 30px ${step.color}30` }}>
                <span className="text-2xl font-bold" style={{ color: step.color }}>{step.number}</span>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-[#6b6b80] text-sm leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack Section ────────────────────────────────────────────────────────

const techStack = [
  { name: "Next.js 16", desc: "App Router + custom Node server" },
  { name: "TypeScript", desc: "Strict mode throughout" },
  { name: "PostgreSQL", desc: "Prisma v7 with driver adapter" },
  { name: "Socket.io v4", desc: "Real-time workspace rooms" },
  { name: "NextAuth v5", desc: "Google · GitHub · Email" },
  { name: "Gemini AI", desc: "Summaries + task descriptions" },
  { name: "Razorpay", desc: "INR billing + webhooks" },
  { name: "Tailwind CSS v4", desc: "Zero-config @theme API" },
];

function TechSection() {
  return (
    <section className="py-20 px-6 border-t border-[#1e1e2e]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12">
          <span className="inline-block text-[13px] font-semibold tracking-widest uppercase text-[#6366f1] mb-4">
            Under the hood
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Built with the right tools
          </h2>
          <p className="text-[#a0a0b0] text-base max-w-lg mx-auto">
            No filler dependencies. Every choice was made for a specific reason.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {techStack.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="rounded-xl border border-[#2a2a3e] bg-[#111118] p-4 hover:border-[#3a3a52] transition-colors">
              <p className="text-white text-sm font-semibold mb-1">{t.name}</p>
              <p className="text-[#6b6b80] text-xs leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing Section ───────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "For individuals and small teams getting started.",
    features: ["1 workspace", "Up to 3 members", "100 tasks", "Basic Kanban board", "Community support"],
    cta: "Get started free",
    href: "/register",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For teams that need real power — no artificial limits.",
    features: ["Unlimited workspaces", "Unlimited members", "Unlimited tasks", "AI-powered analytics", "Live docs & real-time sync", "Slack, GitHub & Discord", "Priority support"],
    cta: "Upgrade to Pro",
    href: "/register",
    highlighted: true,
    badge: "Most Popular",
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16">
          <span className="inline-block text-[13px] font-semibold tracking-widest uppercase text-[#6366f1] mb-4">
            Transparent pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            Simple plans, no surprises
          </h2>
          <p className="text-[#a0a0b0] text-lg max-w-xl mx-auto">
            Start free forever. Upgrade when your team is ready.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-3xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`rounded-2xl p-7 border flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "border-[#6366f1] scale-[1.02]"
                  : "border-[#2a2a3e] hover:border-[#3a3a52]"
              }`}
              style={{
                background: plan.highlighted ? "rgba(99,102,241,0.08)" : "#111118",
                boxShadow: plan.highlighted ? "0 0 50px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.4)" : "0 2px 20px rgba(0,0,0,0.2)",
              }}>
              {/* Badge */}
              {plan.badge && (
                <div className="mb-4">
                  <span className="inline-block text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-white text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-[#6b6b80] text-sm mb-5">{plan.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-[#6b6b80] text-sm">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-[#c0c0d0]">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.highlighted ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)" }}>
                      <Check size={11} className="text-[#6366f1]" strokeWidth={3} />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`w-full text-center py-3 rounded-xl font-semibold text-[14px] transition-all duration-200 ${
                  plan.highlighted
                    ? "text-white hover:opacity-90 hover:scale-[1.02]"
                    : "text-white border border-[#2a2a3e] hover:border-[#6366f1]/50 hover:bg-white/[0.04]"
                }`}
                style={plan.highlighted ? { background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" } : {}}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.20) 50%, rgba(236,72,153,0.15) 100%)",
            border: "1px solid rgba(99,102,241,0.4)",
            boxShadow: "0 0 80px rgba(99,102,241,0.2)",
          }}>
          {/* Decorative orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
              filter: "blur(40px)",
            }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
              filter: "blur(40px)",
            }} />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              Start for free today
            </h2>
            <p className="text-[#c0c0d0] text-lg mb-8 max-w-md mx-auto">
              Free forever on the starter plan. Upgrade when your team grows. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 hover:opacity-90 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <span className="text-[#6b6b80] text-sm">No credit card · Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
    Support: ["Docs", "Status", "Contact", "Community"],
  };

  return (
    <footer className="border-t border-[#2a2a3e] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
                W
              </div>
              <span className="font-semibold text-white text-[15px] tracking-tight">WorkspaceFlow</span>
            </div>
            <p className="text-[#6b6b80] text-sm leading-relaxed max-w-xs">
              The all-in-one workspace for modern teams. Kanban, docs, chat, and analytics — unified.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-white text-[13px] font-semibold mb-4">{group}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[#6b6b80] text-sm hover:text-white transition-colors duration-150">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#1e1e2e] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#6b6b80] text-sm">
            © {new Date().getFullYear()} WorkspaceFlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <a key={social} href="#"
                className="text-[#6b6b80] text-sm hover:text-white transition-colors duration-150">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page Root ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f0f0f5" }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechSection />
      <PricingSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
