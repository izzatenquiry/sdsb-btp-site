"use client";

import { useEffect } from "react";
import "./welcome-splash.css";

type Props = {
  name: string;
  role?: string;
  durationMs?: number;
  onDone: () => void;
};

function greeting(): string {
  const hour = Number(
    new Date().toLocaleString("en-MY", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Kuala_Lumpur",
    }),
  );
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "D";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function WelcomeSplash({ name, role, durationMs = 2800, onDone }: Props) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(onDone, reduced ? 700 : durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDone]);

  const displayName = name.trim() || "NUR DAMIA BT SHAFEE";

  return (
    <div
      className="welcome-splash fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-navy text-header-fg"
      role="status"
      aria-live="polite"
      style={{ ["--welcome-duration" as string]: `${durationMs}ms` }}
    >
      <div className="welcome-splash-glow" aria-hidden />
      <div className="relative flex flex-col items-center px-6 text-center">
        <h1 className="welcome-splash-line welcome-splash-line--1 display mb-6 text-2xl font-semibold tracking-tight sm:text-4xl text-white">
          Welcome
        </h1>
        <div className="welcome-splash-avatar relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
          <span className="welcome-splash-ring" aria-hidden />
          <span className="welcome-splash-ring welcome-splash-ring--delay" aria-hidden />
          <span className="display relative flex h-full w-full items-center justify-center rounded-full bg-accent text-2xl font-bold text-white shadow-lg shadow-accent/30 sm:text-3xl">
            {initials(displayName)}
          </span>
        </div>

        <p className="welcome-splash-line welcome-splash-line--2 mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {greeting()}
        </p>
        <p className="welcome-splash-line welcome-splash-line--2 display mt-2 text-2xl font-semibold tracking-tight sm:text-4xl text-white">
          {displayName}
        </p>
        {role ? (
          <p className="welcome-splash-line welcome-splash-line--3 mt-2 text-sm text-teal-300 font-medium">{role}</p>
        ) : null}

        <div className="welcome-splash-line welcome-splash-line--4 mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div className="welcome-splash-progress h-full rounded-full bg-accent-bright" />
        </div>
        <p className="welcome-splash-line welcome-splash-line--4 mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          SDSB · BTP QAQC — Opening dashboard
        </p>
      </div>
    </div>
  );
}
