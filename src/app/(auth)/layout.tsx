import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: {
    default: "Sign in to WorkspaceFlow",
    template: "%s | WorkspaceFlow",
  },
};

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2" fill="#ff5c00" />
      <rect x="16" y="2" width="10" height="10" rx="2" fill="#ff5c00" opacity="0.5" />
      <rect x="2" y="16" width="10" height="10" rx="2" fill="#ff5c00" opacity="0.5" />
      <rect x="16" y="16" width="10" height="10" rx="2" fill="#ff5c00" opacity="0.25" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060609] flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 grid-pattern" />

        {/* Teal radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-5%", left: "-10%", width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "10%", right: "5%", width: "350px", height: "350px",
            background: "radial-gradient(circle, rgba(255,92,0,0.05) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
        />

        {/* Thin orange top-border accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,92,0,0.4), transparent)" }}
        />

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-white" style={{ fontSize: "15px", letterSpacing: "-0.025em" }}>
              WorkspaceFlow
            </span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-8">
              <span
                className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{
                  color: "#ff5c00",
                  background: "rgba(255,92,0,0.08)",
                  border: "1px solid rgba(255,92,0,0.2)",
                  letterSpacing: "0.06em",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#ff5c00", boxShadow: "0 0 6px rgba(255,92,0,0.8)" }}
                />
                TRUSTED BY 2,400+ TEAMS
              </span>
            </div>

            <h1
              className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5"
              style={{ letterSpacing: "-0.04em" }}
            >
              Your team.
              <br />
              One workspace.
              <br />
              <span style={{ color: "#ff5c00" }}>No chaos.</span>
            </h1>

            <p className="text-base leading-relaxed mb-10 max-w-sm" style={{ color: "rgba(240,240,248,0.48)" }}>
              Kanban boards, real-time collaboration, team docs, and sprint analytics — built for how teams actually work.
            </p>

            <div className="space-y-4">
              {[
                "Visual Kanban boards with drag & drop",
                "Real-time multiplayer collaboration",
                "Rich team documentation & wikis",
                "Advanced analytics & sprint insights",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,92,0,0.1)", border: "1px solid rgba(255,92,0,0.2)" }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#ff5c00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm" style={{ color: "rgba(240,240,248,0.55)" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex -space-x-2 flex-shrink-0 mt-0.5">
                {([ ["#ff5c00","S"], ["#60a5fa","M"], ["#a78bfa","A"] ] as [string,string][]).map(([c,l],i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: c, borderColor: "#0f0d0b", zIndex: 3 - i }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(240,240,248,0.55)" }}>
                  &ldquo;WorkspaceFlow replaced four different tools for us. Our team shipped 3&times; faster in the first month.&rdquo;
                </p>
                <p className="mt-2 text-xs" style={{ color: "rgba(240,240,248,0.3)" }}>
                  Sarah K. — Engineering Lead, Axiom Labs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,92,0,0.04) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <Logo />
          <span className="font-bold text-white text-sm" style={{ letterSpacing: "-0.02em" }}>WorkspaceFlow</span>
        </div>

        {/* Theme toggle — top right */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        <div className="relative z-10 w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
