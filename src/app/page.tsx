"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Check, ArrowRight, LayoutGrid, Users, BarChart3, FileText, Zap, Plug } from "lucide-react";

const up: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2" fill="#2dd4bf" />
      <rect x="16" y="2" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.5" />
      <rect x="2" y="16" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.5" />
      <rect x="16" y="16" width="10" height="10" rx="2" fill="#2dd4bf" opacity="0.25" />
    </svg>
  );
}

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6">
      <div
        className="max-w-6xl mx-auto mt-4 rounded-2xl flex items-center justify-between h-14 px-5"
        style={{
          background: "rgba(9,9,14,0.88)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={22} />
          <span className="font-bold text-white" style={{ fontSize: "15px", letterSpacing: "-0.025em" }}>
            WorkspaceFlow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {["Features", "Pricing", "Changelog"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[13px] font-medium transition-colors hover:text-white"
              style={{ color: "rgba(240,240,248,0.45)" }}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-[13px] font-medium px-4 py-2 rounded-xl transition-colors hover:text-white"
            style={{ color: "rgba(240,240,248,0.5)" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl text-[#020608] transition-all hover:opacity-90"
            style={{ background: "#2dd4bf" }}
          >
            Get started
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Kanban mockup ─────────────────────────────────────────────────────────────

const columns = [
  {
    id: "todo", label: "To Do", dot: "#5a5a7a",
    cards: [{ title: "Redesign onboarding", tag: "Design", pri: "P1" }, { title: "API rate limiting", tag: "Backend", pri: "P2" }],
  },
  {
    id: "progress", label: "In Progress", dot: "#2dd4bf",
    cards: [{ title: "Kanban drag & drop", tag: "Feature", pri: "P0" }, { title: "Real-time sync", tag: "Backend", pri: "P1" }, { title: "Mobile responsive", tag: "Frontend", pri: "P2" }],
  },
  {
    id: "review", label: "Review", dot: "#f59e0b",
    cards: [{ title: "Payment integration", tag: "Billing", pri: "P1" }, { title: "Analytics v1", tag: "Feature", pri: "P2" }],
  },
  {
    id: "done", label: "Done", dot: "#22c55e",
    cards: [{ title: "Auth with NextAuth v5", tag: "Security", pri: "P0" }, { title: "Team invite emails", tag: "Backend", pri: "P1" }],
  },
];

const tagColors: Record<string, string> = {
  Design: "#a78bfa", Backend: "#60a5fa", Frontend: "#f472b6",
  Feature: "#2dd4bf", Billing: "#34d399", Security: "#fb923c",
};

function KanbanPreview() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#08080e" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-4 h-9 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0c0c15" }}
      >
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
          <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.65 }} />
        ))}
        <div
          className="ml-3 flex items-center px-2 h-5 rounded-md"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", minWidth: 160 }}
        >
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            app.workspaceflow.io/board
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar strip */}
        <div
          className="w-10 flex flex-col items-center pt-3 gap-3 shrink-0"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
        >
          {[LayoutGrid, FileText, Users, BarChart3].map((Icon, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: i === 0 ? "rgba(45,212,191,0.12)" : "transparent",
                color: i === 0 ? "#2dd4bf" : "rgba(255,255,255,0.2)",
              }}
            >
              <Icon size={12} />
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto p-3">
          <div className="flex gap-2.5 min-w-max">
            {columns.map((col) => (
              <div key={col.id} className="w-[170px] shrink-0">
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                  <span className="text-[11px] font-semibold" style={{ color: "rgba(240,240,248,0.7)" }}>
                    {col.label}
                  </span>
                  <span
                    className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {col.cards.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {col.cards.map((card, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg"
                      style={{ background: "#0f0f1c", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p
                        className="text-[11px] font-medium mb-1.5 leading-snug"
                        style={{ color: "rgba(240,240,248,0.85)" }}
                      >
                        {card.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            color: tagColors[card.tag] ?? "#2dd4bf",
                            background: `${tagColors[card.tag] ?? "#2dd4bf"}18`,
                          }}
                        >
                          {card.tag}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.22)" }}>
                          {card.pri}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full text-[10px] py-1.5 rounded-lg border border-dashed"
                    style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.18)" }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%", left: "50%", transform: "translateX(-50%)",
          width: "560px", height: "560px",
          background: "radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 65%)",
          filter: "blur(30px)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={up} className="flex justify-center mb-8">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              color: "#2dd4bf",
              background: "rgba(45,212,191,0.08)",
              border: "1px solid rgba(45,212,191,0.2)",
              letterSpacing: "0.07em",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#2dd4bf", boxShadow: "0 0 6px rgba(45,212,191,0.9)" }}
            />
            NOW IN PUBLIC BETA
          </span>
        </motion.div>

        <motion.h1
          variants={up}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6"
          style={{ letterSpacing: "-0.045em", lineHeight: "1.04" }}
        >
          Your team.
          <br />
          One workspace.
          <br />
          <span style={{ color: "#2dd4bf" }}>No chaos.</span>
        </motion.h1>

        <motion.p
          variants={up}
          className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(240,240,248,0.48)" }}
        >
          WorkspaceFlow combines Kanban boards, real-time collaboration, team
          docs, and sprint analytics — so your team stops context-switching and
          starts shipping.
        </motion.p>

        <motion.div variants={up} className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#020608] text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#2dd4bf", boxShadow: "0 0 24px rgba(45,212,191,0.28)" }}
          >
            Start for free
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
            style={{ color: "rgba(240,240,248,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Sign in
          </Link>
        </motion.div>

        <motion.p
          variants={up}
          className="mt-5 text-xs"
          style={{ color: "rgba(240,240,248,0.28)" }}
        >
          Free forever plan &middot; No credit card required &middot; Deploy in 60 seconds
        </motion.p>

        <motion.div variants={up} className="mt-16">
          <KanbanPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

const features = [
  { icon: LayoutGrid, title: "Visual Kanban boards", desc: "Drag, drop, and ship. Customisable columns, priority flags, and assignees — built for real teams." },
  { icon: Users, title: "Real-time presence", desc: "See where teammates are and what they are editing, live. No stale data, no awkward overwrites." },
  { icon: FileText, title: "Team documentation", desc: "Write specs, runbooks, and wikis alongside your work — versioned, searchable, linked to tasks." },
  { icon: BarChart3, title: "Sprint analytics", desc: "Cycle time, velocity, bottleneck detection. Know why sprints slip before they slip." },
  { icon: Plug, title: "Native integrations", desc: "GitHub, Slack, Zapier, and a full REST API. Connect the stack you already have." },
  { icon: Zap, title: "AI task assistant", desc: "Describe a feature in plain English. Get a structured task breakdown, ready for the board." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={up}
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#2dd4bf" }}
          >
            Everything your team needs
          </motion.p>
          <motion.h2
            variants={up}
            className="text-4xl sm:text-5xl font-extrabold text-white"
            style={{ letterSpacing: "-0.035em" }}
          >
            Built for how teams
            <br />
            actually work
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          style={{ background: "rgba(255,255,255,0.055)", borderRadius: "16px", overflow: "hidden" }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={up}
              className="group p-6 transition-colors duration-200 cursor-default"
              style={{ background: "#06060a" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0d0d16"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#06060a"; }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.13)" }}
              >
                <Icon size={17} style={{ color: "#2dd4bf" }} />
              </div>
              <h3 className="font-bold text-white mb-2" style={{ fontSize: "14px", letterSpacing: "-0.02em" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,240,248,0.42)" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────

const freePlan = [
  "3 workspaces",
  "Unlimited tasks & boards",
  "5 members per workspace",
  "1 GB storage",
  "Basic analytics",
  "Community support",
];

const proPlan = [
  "Unlimited workspaces",
  "Unlimited team members",
  "Real-time presence & live cursors",
  "Advanced analytics & sprint insights",
  "AI task assistant",
  "Custom integrations + REST API",
  "25 GB storage",
  "Priority support",
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p variants={up} className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#2dd4bf" }}>
            Pricing
          </motion.p>
          <motion.h2
            variants={up}
            className="text-4xl sm:text-5xl font-extrabold text-white"
            style={{ letterSpacing: "-0.035em" }}
          >
            Simple. Honest. No surprises.
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Free tier */}
          <motion.div
            variants={up}
            className="p-8 rounded-2xl"
            style={{ background: "#0d0d15", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: "rgba(240,240,248,0.45)" }}>Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: "-0.04em" }}>$0</span>
              <span className="text-sm mb-1.5" style={{ color: "rgba(240,240,248,0.35)" }}>/ forever</span>
            </div>
            <p className="text-sm mb-8" style={{ color: "rgba(240,240,248,0.38)" }}>
              Everything to get started. No card required.
            </p>
            <Link
              href="/register"
              className="block text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,240,248,0.75)" }}
            >
              Create free account
            </Link>
            <ul className="space-y-3">
              {freePlan.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(240,240,248,0.5)" }}>
                  <Check size={13} className="mt-0.5 shrink-0" style={{ color: "rgba(45,212,191,0.6)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pro tier */}
          <motion.div
            variants={up}
            className="p-8 rounded-2xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d1a18 0%, #0d0d15 100%)", border: "1px solid rgba(45,212,191,0.22)" }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(45,212,191,0.09) 0%, transparent 70%)", filter: "blur(20px)" }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold" style={{ color: "rgba(240,240,248,0.65)" }}>Pro</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: "rgba(45,212,191,0.1)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.18)" }}
                >
                  Most popular
                </span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: "-0.04em" }}>$12</span>
                <span className="text-sm mb-1.5" style={{ color: "rgba(240,240,248,0.35)" }}>/ seat / month</span>
              </div>
              <p className="text-sm mb-8" style={{ color: "rgba(240,240,248,0.38)" }}>
                The full picture. Annual billing, or $15/mo monthly.
              </p>
              <Link
                href="/register"
                className="block text-center py-3 rounded-xl font-semibold text-sm text-[#020608] mb-8 transition-all hover:opacity-90"
                style={{ background: "#2dd4bf", boxShadow: "0 0 20px rgba(45,212,191,0.22)" }}
              >
                Start Pro trial — 14 days free
              </Link>
              <ul className="space-y-3">
                {proPlan.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(240,240,248,0.6)" }}>
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: "#2dd4bf" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonial ───────────────────────────────────────────────────────────────

function Testimonial() {
  return (
    <section className="py-16 px-4">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <motion.blockquote
          variants={up}
          className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-snug"
          style={{ letterSpacing: "-0.03em" }}
        >
          &ldquo;WorkspaceFlow replaced four tools for us. We shipped 3&times; faster in the first month.&rdquo;
        </motion.blockquote>
        <motion.div variants={up} className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {([ ["#2dd4bf","S"], ["#60a5fa","M"], ["#a78bfa","A"] ] as [string,string][]).map(([c,l],i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: c, borderColor: "#060609", zIndex: 3 - i }}
              >
                {l}
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Sarah K.</p>
            <p className="text-xs" style={{ color: "rgba(240,240,248,0.38)" }}>Engineering Lead, Axiom Labs</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <motion.div
          variants={up}
          className="inline-block p-px rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.35), rgba(45,212,191,0.08))" }}
        >
          <div className="px-8 py-12 rounded-2xl" style={{ background: "#09090f" }}>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
              style={{ letterSpacing: "-0.04em" }}
            >
              Ready to ship faster?
            </h2>
            <p className="text-base mb-8" style={{ color: "rgba(240,240,248,0.45)" }}>
              Join thousands of teams who stopped juggling tools and started moving faster.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-[#020608] transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "#2dd4bf", boxShadow: "0 0 28px rgba(45,212,191,0.3)" }}
            >
              Start for free
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <p className="mt-4 text-xs" style={{ color: "rgba(240,240,248,0.28)" }}>
              No credit card required &middot; Free plan available forever
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };
  return (
    <footer className="border-t py-16 px-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={20} />
              <span className="font-bold text-white text-sm" style={{ letterSpacing: "-0.02em" }}>
                WorkspaceFlow
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(240,240,248,0.32)" }}>
              Real-time project management for teams who care about how they work.
            </p>
          </div>
          {Object.entries(links).map(([col, items]) => (
            <div key={col}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "rgba(240,240,248,0.28)" }}
              >
                {col}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "rgba(240,240,248,0.42)" }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs" style={{ color: "rgba(240,240,248,0.22)" }}>
            2025 WorkspaceFlow. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(240,240,248,0.18)" }}>
            Built with precision for teams that ship.
          </p>
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
      <Testimonial />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
