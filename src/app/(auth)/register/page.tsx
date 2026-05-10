"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Validation schema ─────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be under 100 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password strength helper ──────────────────────────────────────────────────

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    label: string;
    met: boolean;
  }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character (!@#$…)", met: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "#ef4444" },
    1: { label: "Weak", color: "#f97316" },
    2: { label: "Fair", color: "#f59e0b" },
    3: { label: "Good", color: "#84cc16" },
    4: { label: "Strong", color: "#10b981" },
    5: { label: "Very strong", color: "#10b981" },
  };

  return { score, checks, ...map[score] };
}

// ─── OAuth button ──────────────────────────────────────────────────────────────

function OAuthButton({
  icon,
  label,
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full h-11 flex items-center justify-center gap-3 rounded-xl text-sm font-medium text-white/80 transition-all duration-200 hover:text-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.13)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [showStrengthChecks, setShowStrengthChecks] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  // Keep password value in sync for the strength indicator
  const watchedPassword = watch("password", "");
  const strength = getPasswordStrength(watchedPassword);

  // ── Registration + auto sign-in ────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const body = await res.json();

      if (res.status === 409) {
        toast.error("An account with this email already exists. Try signing in.");
        return;
      }

      if (!res.ok) {
        toast.error(body?.error ?? "Registration failed. Please try again.");
        return;
      }

      // Account created — sign in immediately
      toast.success("Account created! Signing you in…");

      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        // Rare: account was created but credentials sign-in failed
        toast.error("Account created! Please sign in manually.");
        window.location.href = "/login";
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // ── OAuth sign-up ──────────────────────────────────────────────────────────
  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      toast.error(`Could not sign up with ${provider === "google" ? "Google" : "GitHub"}.`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Create your account</h2>
        <p className="text-sm text-white/50">
          Get started free — no credit card required.
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-3 mb-6">
        <OAuthButton
          loading={oauthLoading === "google"}
          onClick={() => handleOAuth("google")}
          label="Sign up with Google"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
          }
        />
        <OAuthButton
          loading={oauthLoading === "github"}
          onClick={() => handleOAuth("github")}
          label="Sign up with GitHub"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          }
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[#2a2a3e]" />
        <span className="text-xs text-white/30 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-[#2a2a3e]" />
      </div>

      {/* Registration form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            leftIcon={<User size={15} />}
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {/* Password + strength */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            leftIcon={<Lock size={15} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            error={errors.password?.message}
            onFocus={() => setShowStrengthChecks(true)}
            {...register("password")}
          />

          {/* Strength bar — only shown once user starts typing */}
          {(showStrengthChecks || watchedPassword.length > 0) && watchedPassword.length > 0 && (
            <div className="pt-1 space-y-2">
              {/* Bar */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((segment) => (
                  <div
                    key={segment}
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        strength.score >= segment
                          ? strength.color
                          : "rgba(255,255,255,0.07)",
                    }}
                  />
                ))}
              </div>

              {/* Label + checklist */}
              <div className="flex items-start justify-between gap-4">
                <div className="grid grid-cols-1 gap-1">
                  {strength.checks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5">
                      {check.met ? (
                        <CheckCircle2
                          size={12}
                          className="flex-shrink-0"
                          style={{ color: "#10b981" }}
                        />
                      ) : (
                        <XCircle
                          size={12}
                          className="flex-shrink-0 text-white/20"
                        />
                      )}
                      <span
                        className="text-xs transition-colors duration-200"
                        style={{ color: check.met ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)" }}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>

                <span
                  className="text-xs font-semibold flex-shrink-0 mt-0.5 transition-colors duration-300"
                  style={{ color: watchedPassword.length === 0 ? "transparent" : strength.color }}
                >
                  {strength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            leftIcon={<Lock size={15} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {!isSubmitting && (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
          {isSubmitting && "Creating account…"}
        </Button>
      </form>

      {/* Sign-in link */}
      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#2dd4bf] font-medium hover:text-[#5eead4] transition-colors"
        >
          Sign in
        </Link>
      </p>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-white/25 leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-white/40 transition-colors">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-white/40 transition-colors">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
