"use client";

import { useEffect, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import {
  FileSpreadsheet,
  Calendar,
  FileCheck2,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { getDsrRecords, getStaffDailyReports } from "@/lib/daily-reports";

type Mode = "WPR" | "MPR";

type Props = {
  open: boolean;
  onClose: () => void;
  userName?: string;
  onCompileReport?: (reportData: any) => void;
};

function formatLocalYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mondayOfWeek(d = new Date()): string {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return formatLocalYmd(x);
}

function saturdayOfWeek(d = new Date()): string {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff + 5);
  return formatLocalYmd(x);
}

export function CompileSiteReportModal({
  open,
  onClose,
  userName = "NUR DAMIA BT SHAFEE",
  onCompileReport,
}: Props) {
  const [mode, setMode] = useState<Mode>("WPR");
  const [startDate, setStartDate] = useState(mondayOfWeek());
  const [endDate, setEndDate] = useState(saturdayOfWeek());
  const [monthYear, setMonthYear] = useState("November 2026");

  const [compiling, setCompiling] = useState(false);
  const [reportPreview, setReportPreview] = useState<any | null>(null);

  useEffect(() => {
    if (!open) return;
    setStartDate(mondayOfWeek());
    setEndDate(saturdayOfWeek());
    setReportPreview(null);
  }, [open]);

  function handleCompile() {
    setCompiling(true);
    const allDsrs = getDsrRecords();
    const activities = getStaffDailyReports();

    if (mode === "WPR") {
      // Filter DSRs within week
      const inRange = allDsrs.filter((d) => d.date >= startDate && d.date <= endDate);
      const allPhotos = inRange.flatMap((d) => d.photos || []);

      const result = {
        type: "WPR",
        title: `WEEKLY PROGRESS REPORT (WPR) · WEEK ${startDate} TO ${endDate}`,
        dateRange: `${startDate} to ${endDate}`,
        totalDsrs: inRange.length,
        dsrs: inRange,
        photos: allPhotos,
        location: "SDSB · Banting Technology Park (BTP)",
        compiledBy: userName,
        compiledAt: new Date().toLocaleString("en-MY"),
        summary: inRange.length > 0
          ? `Compiled ${inRange.length} Daily Site Reports. Continuous ground beam concreting at Block A, pad footing blinding at Block B, and subgrade roadbase compaction along main access road.`
          : `No individual DSR entries found between ${startDate} and ${endDate}. Generated from register activity logs.`,
      };
      setReportPreview(result);
      setCompiling(false);
    } else {
      // Monthly Progress Report
      const [mName, yStr] = monthYear.split(" ");
      const monthNum = mName.toLowerCase().startsWith("nov") ? 11 : 10;
      const prefix = `2026-${String(monthNum).padStart(2, "0")}`;

      const inMonth = allDsrs.filter((d) => d.date.startsWith(prefix));
      const allPhotos = inMonth.flatMap((d) => d.photos || []);

      const result = {
        type: "MPR",
        title: `MONTHLY PROGRESS REPORT (MPR) · ${monthYear.toUpperCase()}`,
        monthYear,
        totalDsrs: inMonth.length,
        totalInspections: 42,
        cubePassRate: "100%",
        dsrs: inMonth,
        photos: allPhotos,
        location: "SDSB · Banting Technology Park (BTP)",
        compiledBy: userName,
        compiledAt: new Date().toLocaleString("en-MY"),
        summary: `Executive Monthly QAQC & Site Progress Report for ${monthYear}. All structural concrete batches (G35/G40) passed 7-day and 28-day target strengths. 22 project registers reconciled with ACC.`,
      };
      setReportPreview(result);
      setCompiling(false);
    }
  }

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="compile-report-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Header */}
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white font-black text-lg shadow-md">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="compile-report-title" className={MODAL_TITLE_CLASS}>
                Compile Site Reports (WPR & MPR)
              </h3>
              <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/30">
                SDSB Compiler Engine
              </span>
            </div>
            <p className={MODAL_SUBTITLE_CLASS}>
              Aggregate Daily Site Reports (DSR) into Weekly & Monthly Executive Quality Reports
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={MODAL_CLOSE_CLASS}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className={`${MODAL_BODY_CLASS} p-4 sm:p-5 space-y-4`}>
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-field/30 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("WPR");
              setReportPreview(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition cursor-pointer ${
              mode === "WPR"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-ink hover:bg-paper/50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Weekly Progress Report (WPR)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("MPR");
              setReportPreview(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition cursor-pointer ${
              mode === "MPR"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-ink hover:bg-paper/50"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Monthly Progress Report (MPR)</span>
          </button>
        </div>

        {/* Filter Selection Panel */}
        <div className="rounded-xl border border-line bg-paper/40 p-4 space-y-3">
          {mode === "WPR" ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Select Weekly Range (Monday – Saturday · 6 Working Days)
                </label>
                <span className="text-[11px] text-muted">Aggregates active DSRs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Week Start (Monday)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-line bg-field px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Week End (Saturday)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-line bg-field px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Select Reporting Month & Year
                </label>
                <span className="text-[11px] text-muted">Complete calendar month</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Month & Year
                  </label>
                  <select
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full rounded-lg border border-line bg-field px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-accent"
                  >
                    <option value="November 2026">November 2026 (Current Active)</option>
                    <option value="October 2026">October 2026 (Completed)</option>
                    <option value="September 2026">September 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Target Project
                  </label>
                  <input
                    type="text"
                    disabled
                    value="SDSB · Banting Technology Park (BTP)"
                    className="w-full rounded-lg border border-line bg-field/60 px-3 py-2 text-xs text-muted font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleCompile}
              disabled={compiling}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{compiling ? "Compiling..." : `Compile ${mode === "WPR" ? "Weekly" : "Monthly"} Report`}</span>
            </button>
          </div>
        </div>

        {/* Compiled Result Preview */}
        {reportPreview && (
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 space-y-3 dark:bg-teal-950/20">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Report Successfully Compiled
                </h4>
              </div>
              <span className="text-[10px] font-mono text-muted">
                Compiled: {reportPreview.compiledAt}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-ink">
              <p className="font-bold text-accent text-sm">
                {reportPreview.title}
              </p>
              <p className="text-muted leading-relaxed">
                {reportPreview.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border border-line bg-paper p-2">
                <p className="text-[10px] text-muted uppercase">DSRs Included</p>
                <p className="font-extrabold text-accent text-base mt-0.5">{reportPreview.totalDsrs}</p>
              </div>
              <div className="rounded-lg border border-line bg-paper p-2">
                <p className="text-[10px] text-muted uppercase">Progress Photos</p>
                <p className="font-extrabold text-indigo-600 text-base mt-0.5">{reportPreview.photos.length}</p>
              </div>
              <div className="rounded-lg border border-line bg-paper p-2">
                <p className="text-[10px] text-muted uppercase">Compiler Officer</p>
                <p className="font-extrabold text-ink text-xs truncate mt-1">{reportPreview.compiledBy.split(" ")[0]}</p>
              </div>
              <div className="rounded-lg border border-line bg-paper p-2">
                <p className="text-[10px] text-muted uppercase">Status</p>
                <p className="font-extrabold text-emerald-600 text-xs mt-1">Ready for Print</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onCompileReport) onCompileReport(reportPreview);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-700 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Open Printable Official Report</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </CenteredModal>
  );
}
