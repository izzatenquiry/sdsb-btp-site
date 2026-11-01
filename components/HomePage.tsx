"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileCheck2,
  FileText,
  Clock,
  ShieldCheck,
  Activity,
  ArrowRight,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { WelcomeSplash } from "./WelcomeSplash";
import { applyTheme, readStoredTheme } from "@/lib/theme";

const EMAIL_DOMAIN = "@sdsb.com.my";

const QAQC_FEATURES = [
  {
    title: "Running no.",
    text: "Register New Docs",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    title: "Digital forms",
    text: "RFWI · MAF · ITP · MOS",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "22 Live Registers",
    text: "Google Sheets 2-Way Sync",
    icon: <FileCheck2 className="h-4 w-4" />,
  },
  {
    title: "E-Sign & PDF",
    text: "1:1 Exact A4 PDF Engine",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    title: "Site Testing",
    text: "Cube · Soil FDT · Pile · Lab",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    title: "Audit & SLA",
    text: "Target Dates & Health Checks",
    icon: <Clock className="h-4 w-4" />,
  },
] as const;

function FeatureGrid({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className={`grid ${
        compact ? "mt-4 grid-cols-2 gap-2" : "mt-8 grid-cols-2 gap-3 xl:grid-cols-3"
      }`}
    >
      {QAQC_FEATURES.map((item, i) => (
        <li
          key={item.title}
          className={`flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/[0.08] shadow-sm shadow-black/20 backdrop-blur-md transition-all hover:bg-white/[0.14] hover:border-white/25 ${
            compact ? "p-2.5" : "p-3.5"
          }`}
          style={{ animationDelay: `${0.12 + i * 0.08}s` }}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg bg-teal-500/25 text-teal-300 ring-1 ring-teal-400/40 ${
              compact ? "h-8 w-8" : "h-9 w-9"
            }`}
          >
            {item.icon}
          </span>
          <span className="min-w-0">
            <p className={`font-semibold leading-tight text-slate-100 ${compact ? "text-[12px]" : "text-sm"}`}>
              {item.title}
            </p>
            <p className={`mt-0.5 leading-snug text-slate-300 ${compact ? "text-[10px]" : "text-xs"}`}>
              {item.text}
            </p>
          </span>
        </li>
      ))}
    </ul>
  );
}

function toUsername(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  return v.replace(/[^a-z0-9.@_+-]/g, "");
}

import {
  verifyLogin,
  DEFAULT_PASSWORD,
  StaffUser,
  STAFF_REGISTRY,
  getUserPassword,
  getResolvedStaffUser,
  getStaffAccountsList,
} from "@/lib/auth";

type Props = {
  onLoginSuccess: (user: { name: string; email: string; role?: string }) => void;
};

export function HomePage({ onLoginSuccess }: Props) {
  const [staffList, setStaffList] = useState<Array<StaffUser & { key: string }>>([]);
  const [username, setUsername] = useState("damia");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [welcome, setWelcome] = useState<{ name: string; role?: string; email: string } | null>(null);

  useEffect(() => {
    setStaffList(getStaffAccountsList());
  }, [signInOpen]);

  function handleQuickLogin(staffKey: string) {
    const staff = getResolvedStaffUser(staffKey);
    if (!staff) return;
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setWelcome({
        name: staff.name,
        role: staff.role,
        email: staff.email,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "btp_qaqc_user",
          JSON.stringify({
            name: staff.name,
            email: staff.email,
            role: staff.role,
          }),
        );
      }
    }, 300);
  }

  // Home/Login always renders in modern sleek dark theme matching KLC-GEMAS-DEPOT
  useEffect(() => {
    applyTheme("dark", false);
    return () => {
      applyTheme(readStoredTheme());
    };
  }, []);

  useEffect(() => {
    if (!signInOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) setSignInOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [signInOpen, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const local = toUsername(username);
    if (!local) {
      setError("Please enter your username or work email");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const staff: StaffUser = verifyLogin(local, password);
      setTimeout(() => {
        setLoading(false);
        setWelcome({
          name: staff.name,
          role: staff.role,
          email: staff.email,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "btp_qaqc_user",
            JSON.stringify({
              name: staff.name,
              email: staff.email,
              role: staff.role,
            }),
          );
        }
      }, 350);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Login failed");
    }
  }

  function finishWelcome() {
    if (welcome) {
      applyTheme(readStoredTheme());
      onLoginSuccess({
        name: welcome.name,
        email: welcome.email,
        role: welcome.role,
      });
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0b1220] text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {welcome ? (
        <WelcomeSplash
          name={welcome.name}
          role={welcome.role}
          durationMs={2600}
          onDone={finishWelcome}
        />
      ) : null}

      <div className="relative grid min-h-screen w-full flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Left Section: Hero, Features & Project Metadata (matching KLC-GEMAS-DEPOT) */}
        <section className="relative hidden flex-col justify-between border-r border-white/10 bg-gradient-to-br from-[#0c1626] via-[#09101c] to-[#060a12] p-8 lg:flex xl:p-12">
          {/* Subtle architectural background pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(800px 400px at 15% 20%, rgba(20,184,166,0.18), transparent 60%), radial-gradient(600px 300px at 85% 85%, rgba(15,118,110,0.14), transparent 50%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 ring-1 ring-teal-400/40">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    d="M6 42h36M10 38V14l14-8v32M16 18v20M20 22v16M24 38V6l14 8v24M30 18v20M34 22v16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-400">
                  SDSB · Banting Technology Park
                </p>
                <p className="text-xs text-slate-400 font-medium">Internal QAQC Control Centre</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-bold text-teal-300">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Google Sheets Live 2-Way Sync Active</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-5xl leading-[1.1]">
                SDSB · BANTING TECHNOLOGY PARK
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 xl:text-base">
                Centralized Quality Assurance & Quality Control (QAQC) Control Centre — 22 Internal
                Registers, 1:1 Standardized Digital Forms, PDF Engine, and real-time bidirectional
                Google Sheets synchronization.
              </p>

              <FeatureGrid />
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6 mt-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Main Contractor & Document Control
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                SHENGDING CONSTRUCTION SDN BHD (SDSB)
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Lead DC & Admin: <span className="text-teal-400 font-bold">{staffList.find((s) => s.key === "damia")?.name || "Nur Damia"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Data Integration
              </p>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Google Sheets (1,430 Records)
              </p>
            </div>
          </div>
        </section>

        {/* Right Section: Interactive CTA & Sign In Form */}
        <section className="relative flex min-h-screen min-w-0 flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(600px 300px at 80% 20%, rgba(20,184,166,0.12), transparent 50%), radial-gradient(400px 250px at 20% 80%, rgba(14,165,233,0.08), transparent 45%)",
            }}
          />

          {/* Mobile Header (visible only on small screens) */}
          <div className="relative z-10 mx-auto mb-6 w-full max-w-[440px] flex flex-col items-center text-center lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[10px] font-bold text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>BTP QAQC Control Centre</span>
            </div>
            <h1 className="mt-3 text-center font-extrabold text-white leading-tight">
              <span className="block text-2xl sm:text-3xl">SDSB</span>
              <span className="block text-xl sm:text-2xl mt-0.5 tracking-tight text-white">
                BANTING TECHNOLOGY PARK
              </span>
            </h1>
            <p className="mt-2 text-center text-xs leading-relaxed text-slate-300 max-w-sm">
              Quality Assurance & Control Centre for 22 project registers and governance forms.
            </p>
            <div className="w-full text-left">
              <FeatureGrid compact />
            </div>
          </div>

          {/* Main CTA Button: Enter QAQC Control Centre */}
          {!signInOpen ? (
            <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col items-center justify-center gap-4 text-center">
              <div className="mb-2">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-400 ring-1 ring-teal-400/30 shadow-lg shadow-teal-950/40">
                  <UserCheck className="h-8 w-8" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-white sm:text-2xl">
                  BTP QAQC Control Centre
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Authorized project access for SDSB, Consultant RE & PMC
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-950/70 ring-1 ring-white/20 transition-all hover:bg-teal-500 hover:shadow-teal-600/40 hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
              >
                <span>Enter QAQC Control Centre</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            /* Modal Sign In Form matching KLC-GEMAS-DEPOT */
            <div
              className="relative z-20 mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-2xl text-ink"
              role="dialog"
              aria-modal="true"
              aria-label="Sign in"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-ink">Sign in</h2>
                    <p className="mt-0.5 text-xs text-muted">
                      SDSB & BTP staff only · access with your project account
                    </p>
                  </div>
                  <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    BTP QAQC
                  </span>
                </div>

                {/* Quick Staff Selection Dropdown */}
                <div className="mt-3.5 rounded-xl border border-teal-500/20 bg-teal-500/5 p-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                    Direct Login by Staff Name:
                  </label>
                  <select
                    className="w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-teal-500 cursor-pointer"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      handleQuickLogin(e.target.value);
                    }}
                  >
                    <option value="" disabled>-- Select staff member to login directly --</option>
                    {staffList.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <label className="block text-xs font-bold text-ink">
                    Username or Work Email
                    <div className="mt-1 flex overflow-hidden rounded-xl border border-line bg-field focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                      <input
                        className="w-0 min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
                        value={username}
                        onChange={(e) => setUsername(toUsername(e.target.value))}
                        type="text"
                        autoComplete="username"
                        required
                        placeholder="damia"
                      />
                      {!username.includes("@") && (
                        <span className="flex shrink-0 items-center border-l border-line bg-paper/50 px-3 text-xs font-semibold text-muted select-none">
                          {EMAIL_DOMAIN}
                        </span>
                      )}
                    </div>
                  </label>

                  <label className="block text-xs font-bold text-ink">
                    Password
                    <div className="relative mt-1">
                      <input
                        className="w-full rounded-xl border border-line bg-field px-3.5 py-2.5 pr-12 text-sm text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 placeholder:text-muted"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-1.5 my-auto h-8 px-2.5 text-xs font-medium text-muted hover:text-ink cursor-pointer"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>

                  <div className="flex items-center justify-between text-[11px] text-muted pt-0.5">
                    <span>Default: <code className="bg-paper px-1.5 py-0.5 rounded text-teal-600 dark:text-teal-400 font-bold">ChangeMe123!</code></span>
                    <button
                      type="button"
                      onClick={() => setSignInOpen(false)}
                      className="text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                    >
                      Back
                    </button>
                  </div>

                  {error ? (
                    <div
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-900/30 transition hover:bg-teal-500 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "Authenticating..." : "Enter QAQC Control Centre"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
