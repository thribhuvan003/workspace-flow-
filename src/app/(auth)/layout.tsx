import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in to WorkspaceFlow",
    template: "%s | WorkspaceFlow",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel — decorative, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#0f0f1f] to-[#0a0a0f]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 70% 80%, rgba(168,85,247,0.14) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 10%, rgba(236,72,153,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Animated floating orbs */}
        <div
          className="absolute top-[12%] left-[18%] w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute top-[50%] left-[50%] w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 0 20px rgba(99,102,241,0.5)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v-2h2v2h-2v2h-2v-2z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              WorkspaceFlow
            </span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#a5b4fc",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ boxShadow: "0 0 6px rgba(99,102,241,0.8)" }}
                />
                Trusted by 10,000+ teams
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              One workspace
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #e879f9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                for everything.
              </span>
            </h1>

            <p className="text-[15px] text-white/50 leading-relaxed mb-10 max-w-sm">
              Kanban boards, real-time collaboration, team docs, and analytics — all in one
              beautifully designed workspace.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="4" height="10" rx="1.5" fill="#6366f1" />
                      <rect x="6" y="1" width="4" height="12" rx="1.5" fill="#8b5cf6" opacity="0.7" />
                      <rect x="11" y="5" width="4" height="8" rx="1.5" fill="#a855f7" opacity="0.5" />
                    </svg>
                  ),
                  label: "Visual Kanban boards with drag & drop",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="3" fill="#6366f1" />
                      <circle cx="2.5" cy="8" r="1.5" fill="#6366f1" opacity="0.5" />
                      <circle cx="13.5" cy="8" r="1.5" fill="#6366f1" opacity="0.5" />
                      <circle cx="8" cy="2.5" r="1.5" fill="#6366f1" opacity="0.5" />
                      <circle cx="8" cy="13.5" r="1.5" fill="#6366f1" opacity="0.5" />
                      <line x1="4" y1="8" x2="5" y2="8" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
                      <line x1="11" y1="8" x2="12" y2="8" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
                      <line x1="8" y1="4" x2="8" y2="5" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
                      <line x1="8" y1="11" x2="8" y2="12" stroke="#6366f1" strokeWidth="1" opacity="0.4" />
                    </svg>
                  ),
                  label: "Real-time multiplayer collaboration",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M2 8h8M2 12h10" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                  label: "Rich team documentation & wikis",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 13L6 9l3 2 2-4 2 3"
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect x="1" y="1" width="14" height="14" rx="2" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
                    </svg>
                  ),
                  label: "Advanced analytics & sprint insights",
                },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-sm text-white/60">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div
            className="relative p-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex -space-x-2 flex-shrink-0 mt-0.5">
                {["#6366f1", "#8b5cf6", "#ec4899"].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: color, zIndex: 3 - i }}
                  >
                    {["S", "M", "A"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-white/60 leading-relaxed">
                  &ldquo;WorkspaceFlow replaced four different tools for us. Our team shipped 3x
                  faster in the first month.&rdquo;
                </p>
                <p className="mt-2 text-xs text-white/35">
                  Sarah K. — Engineering Lead at Axiom
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
        {/* Subtle right-side glow */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Mobile logo — only shows on small screens */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 0 16px rgba(99,102,241,0.4)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v-2h2v2h-2v2h-2v-2z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-base font-semibold text-white">WorkspaceFlow</span>
        </div>

        <div className="relative z-10 w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
