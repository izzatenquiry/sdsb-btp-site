"use client";

import { ReactNode, useEffect, useState } from "react";
import { LogOut, ExternalLink, FileSpreadsheet } from "lucide-react";
import { applyTheme, readStoredTheme, ThemeMode, toggleTheme } from "@/lib/theme";
import { GoogleSheetLiveModal } from "./GoogleSheetLiveModal";
import "./appshell.css";

type Props = {
  children: ReactNode;
  activeSection: "Overview" | "Registers" | "Team" | "Forms";
  onSelectSection: (section: "Overview" | "Registers" | "Team" | "Forms") => void;
  onOpenNewRecord: () => void;
  overdueCount?: number;
  openCount?: number;
  totalRecords?: number;
  activeRegistersCount?: number;
  onOpenOverdue?: () => void;
  onOpenHealth?: () => void;
  onOpenProfile?: () => void;
  onOpenTeam?: () => void;
  onOpenFormsBank?: () => void;
  formsBankOpen?: boolean;
  lastUpdated?: Date | null;
  snapshotAsOf?: string;
  sourceFile?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
};

export function AppShell({
  children,
  activeSection,
  onSelectSection,
  onOpenNewRecord,
  overdueCount = 0,
  openCount = 0,
  totalRecords = 1341,
  activeRegistersCount = 22,
  onOpenOverdue,
  onOpenHealth,
  onOpenProfile,
  onOpenTeam,
  onOpenFormsBank,
  formsBankOpen = false,
  lastUpdated,
  snapshotAsOf = "2026-10-30",
  sourceFile = "QAQC Summarylist Banting Data Park - Grouped Tabs.xlsx",
  userName = "Nur Damia",
  userRole = "QAQC DC",
  onLogout,
}: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [googleSheetModalOpen, setGoogleSheetModalOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleThemeToggle() {
    const next = toggleTheme(theme);
    setTheme(next);
  }

  const dateLabel = now
    ? now.toLocaleDateString("en-MY", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
      })
    : "";

  const timeLabel = now
    ? now.toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kuala_Lumpur",
      })
    : "--:--:--";

  const iconBtnClass =
    "inline-flex items-center justify-center rounded-lg p-2 transition bg-white/10 text-slate-300 hover:bg-white/15 hover:text-header-fg cursor-pointer";

  const desktopNavBtnClass =
    "inline-flex h-9 w-[7.5rem] shrink-0 items-center justify-center rounded-lg px-2 text-center text-sm font-semibold shadow-md transition cursor-pointer";

  return (
    <div className="edms-app-shell edms-dashboard-shell flex h-screen max-h-screen flex-col overflow-hidden">
      {/* App Header */}
      <header className="sticky top-0 z-[60] shrink-0 border-b border-white/10 bg-navy text-header-fg shadow-lg shadow-black/30">
        {/* Mobile Header */}
        <div className="flex w-full flex-nowrap items-center justify-between gap-2 px-4 py-2 sm:px-6 xl:hidden">
          <button
            type="button"
            onClick={() => onSelectSection("Overview")}
            className="group min-w-0 flex-1 text-left"
          >
            <p className="display truncate text-lg font-semibold tracking-wide text-header-fg transition group-hover:text-accent-bright sm:text-xl">
              SDSB · BTP DATA PARK
            </p>
            <p className="truncate text-[10px] text-slate-400">
              SDSB QAQC Control Centre · {userName} (Admin)
            </p>
          </button>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={onOpenProfile}
              title={`Profil ${userName} · Document Controller & System Admin`}
              aria-label={`Profil ${userName}`}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-accent/90 text-white font-extrabold text-[11px] shadow ring-1 ring-white/20 hover:brightness-110 cursor-pointer"
            >
              {userName.trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ND"}
            </button>

            <button
              type="button"
              title="Add New Record"
              aria-label="Add New Record"
              onClick={onOpenNewRecord}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-accent text-white shadow-md shadow-black/20 transition hover:brightness-110 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="h-4 w-4" aria-hidden>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setGoogleSheetModalOpen(true)}
              title="Open Google Sheet Live Tracking"
              aria-label="Open Google Sheet Live Tracking"
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10 text-emerald-400 shadow-md shadow-black/20 transition hover:bg-white/15 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-100 ring-1 ring-white/10 transition hover:bg-white/15 cursor-pointer"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              {mobileNavOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
              {overdueCount > 0 && !mobileNavOpen && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                  {overdueCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full flex-nowrap items-center justify-between gap-4 px-4 py-2 sm:px-6 xl:flex xl:px-8">
          <div className="edms-brand-area flex min-w-0 flex-1 items-center gap-5">
            {/* Geometric Architectural Mark for DAMIA */}
            <svg
              className="edms-brand-mark"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 42h36M10 38V14l14-8v32M16 18v20M20 22v16M24 38V6l14 8v24M30 18v20M34 22v16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSelectSection("Overview")}
                className="group block min-w-0 text-left"
              >
                <p className="display text-2xl font-semibold tracking-wide text-header-fg transition group-hover:text-accent-bright xl:text-3xl leading-none">
                  SDSB · BANTING TECHNOLOGY PARK (BTP)
                </p>
              </button>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1 truncate">
                <span>SDSB QAQC · Internal Control Centre</span>
                <span className="text-slate-500">·</span>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="font-bold text-accent-bright underline-offset-2 hover:underline hover:text-white cursor-pointer"
                  title={`View user profile (${userName})`}
                >
                  {userName}
                </button>{" "}
                <span className="font-medium text-slate-300">({userRole})</span>
              </div>
            </div>

            <div className="hidden border-l border-white/10 pl-6 xl:block">
              <p className="text-xs font-medium text-slate-400">{dateLabel}</p>
              <p className="display text-lg font-semibold tabular-nums tracking-wide text-slate-100">
                {timeLabel}
              </p>
            </div>
          </div>

          {/* Desktop Nav Controls */}
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onOpenNewRecord}
              className="inline-flex h-9 px-3.5 shrink-0 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold shadow-md shadow-black/30 hover:brightness-110 transition cursor-pointer"
            >
              + New Register
            </button>


            <button
              type="button"
              onClick={() => onSelectSection("Registers")}
              className={`${desktopNavBtnClass} ${
                activeSection === "Registers"
                  ? "bg-accent text-white shadow-accent/30"
                  : "bg-white/10 text-slate-100 shadow-black/20 hover:bg-white/18 hover:text-white"
              }`}
            >
              22 Registers
            </button>

            <button
              type="button"
              onClick={onOpenFormsBank || (() => onSelectSection("Forms"))}
              className={`${desktopNavBtnClass} ${
                formsBankOpen || activeSection === "Forms"
                  ? "bg-accent text-white shadow-accent/30"
                  : "bg-white/10 text-slate-100 shadow-black/20 hover:bg-white/18 hover:text-white"
              }`}
            >
              Forms Bank
            </button>

            <button
              type="button"
              onClick={onOpenTeam}
              className={`${desktopNavBtnClass} ${
                activeSection === "Team"
                  ? "bg-accent text-white shadow-accent/30"
                  : "bg-white/10 text-slate-100 shadow-black/20 hover:bg-white/18 hover:text-white"
              }`}
            >
              Team
            </button>

            <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />

            {/* Google Sheet Live Modal Trigger */}
            <button
              type="button"
              onClick={() => setGoogleSheetModalOpen(true)}
              title="Open Google Sheet Live Tracking"
              aria-label="Open Google Sheet Live Tracking"
              className={iconBtnClass}
            >
              <FileSpreadsheet className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition" />
            </button>

            {/* Overdue / Action Trigger */}
            <button
              type="button"
              title={
                overdueCount > 0
                  ? `${overdueCount} overdue actions awaiting response`
                  : "No overdue items"
              }
              aria-label={`${overdueCount} overdue actions`}
              onClick={onOpenOverdue}
              className={`relative inline-flex items-center justify-center rounded-lg p-2 transition ${
                overdueCount > 0
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-500/30"
                  : "bg-white/8 text-slate-300 hover:bg-white/12 hover:text-header-fg"
              } cursor-pointer`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {overdueCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                  {overdueCount}
                </span>
              )}
            </button>

            {/* Daylight / Dark Mode Switcher */}
            <button
              type="button"
              onClick={handleThemeToggle}
              title={theme === "light" ? "Switch to dark mode" : "Switch to daylight mode"}
              aria-label="Toggle Theme"
              className={iconBtnClass}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                {theme === "light" ? (
                  <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                  </>
                )}
              </svg>
            </button>

            {/* User Profile Avatar */}
            <button
              type="button"
              onClick={onOpenProfile}
              title={`${userName} · ${userRole}`}
              aria-label="User Profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white font-extrabold text-xs shadow hover:brightness-110 cursor-pointer ml-1"
            >
              {userName.trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ND"}
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out & return to Home"
                aria-label="Sign out"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 hover:border-rose-500/30 transition cursor-pointer ml-1"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span className="hidden 2xl:inline">Sign Out</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Slideout Drawer */}
        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-navy/95 p-4 backdrop-blur xl:hidden">
            {/* User Profile Card in Mobile Menu */}
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setMobileNavOpen(false);
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-white font-black text-xs shadow hover:scale-105 transition cursor-pointer"
                >
                  {userName.trim().split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ND"}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm truncate">{userName}</span>
                    <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 border border-teal-500/30">
                      QAQC
                    </span>
                  </div>
                  <p className="text-[11px] text-accent-bright font-medium truncate">
                    {userRole}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setMobileNavOpen(false);
                  }}
                  className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
                >
                  Profile
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileNavOpen(false);
                    }}
                    className="shrink-0 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-1.5 text-xs font-semibold hover:bg-rose-500/30 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {/* Row 1: Dashboard | Register */}
              <button
                type="button"
                onClick={() => {
                  onSelectSection("Overview");
                  setMobileNavOpen(false);
                }}
                className={`flex h-11 items-center justify-center rounded-xl text-center text-sm font-bold shadow-xs transition cursor-pointer ${
                  activeSection === "Overview"
                    ? "bg-accent text-white shadow-accent/30"
                    : "bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectSection("Registers");
                  setMobileNavOpen(false);
                }}
                className={`flex h-11 items-center justify-center rounded-xl text-center text-sm font-bold shadow-xs transition cursor-pointer ${
                  activeSection === "Registers"
                    ? "bg-accent text-white shadow-accent/30"
                    : "bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                Register
              </button>

              {/* Row 2: Templates | Team */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenFormsBank) {
                    onOpenFormsBank();
                  } else {
                    onSelectSection("Forms");
                  }
                  setMobileNavOpen(false);
                }}
                className={`flex h-11 items-center justify-center rounded-xl text-center text-sm font-bold shadow-xs transition cursor-pointer ${
                  formsBankOpen || activeSection === "Forms"
                    ? "bg-accent text-white shadow-accent/30"
                    : "bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                Templates
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenTeam) onOpenTeam();
                  setMobileNavOpen(false);
                }}
                className={`flex h-11 items-center justify-center rounded-xl text-center text-sm font-bold shadow-xs transition cursor-pointer ${
                  activeSection === "Team"
                    ? "bg-accent text-white shadow-accent/30"
                    : "bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                Team
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-h-0 px-2 pt-2 pb-1 sm:px-5 xl:px-6 overflow-y-auto xl:overflow-hidden">
        {children}
      </main>

      {/* Shared Footer */}
      <footer className="edms-app-footer mt-auto shrink-0 border-t border-line bg-paper/60 px-3 py-1.5 sm:px-6 xl:px-8">
        <div className="flex flex-col items-center justify-between gap-1.5 sm:flex-row">
          <div className="edms-footer-brand flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
            <div>
              <span className="text-[11px] sm:text-xs">SDSB · BANTING TECHNOLOGY PARK (BTP) QAQC</span>
              <small className="hidden sm:block">INTERNAL REGISTER CONTROL CENTRE · 22 REGISTER SNAPSHOT</small>
            </div>
            <button
              type="button"
              onClick={() => setGoogleSheetModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer"
              title="Open Google Sheet live modal"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GOOGLE SHEETS LIVE SYNC ACTIVE</span>
              <FileSpreadsheet className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="edms-footer-note flex items-center divide-x divide-line text-xs">
            <button
              type="button"
              onClick={() => setGoogleSheetModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 pr-2 hover:text-accent cursor-pointer transition group text-left"
              title="Click to view live Google Sheet inside modal"
            >
              <span className="text-muted">Source:</span>
              <span className="font-semibold text-accent group-hover:underline underline-offset-2">{sourceFile}</span>
              <FileSpreadsheet className="h-3 w-3 text-accent shrink-0" />
            </button>
            <span className="px-2">Snapshot: {snapshotAsOf}</span>
            <button
              type="button"
              onClick={onOpenHealth}
              className="text-accent font-semibold hover:underline cursor-pointer pl-2 flex items-center gap-1"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Storage: Active (Health Info)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Fullpage Google Sheet Live Modal */}
      {googleSheetModalOpen && (
        <GoogleSheetLiveModal
          open={googleSheetModalOpen}
          onClose={() => setGoogleSheetModalOpen(false)}
          sheetId="11Wfxz7mFVR2Gq1vuSsix_pQSVhQXgDl3Tk1B4eaKSFs"
          sheetTitle="Internal QAQC Live Tracking"
        />
      )}
    </div>
  );
}
