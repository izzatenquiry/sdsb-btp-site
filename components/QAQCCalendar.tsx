"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Filter,
} from "lucide-react";
import type { RecordRow } from "./RecordModal";

type Props = {
  records: RecordRow[];
  onSelectRecord: (record: RecordRow) => void;
  onOpenNewRecord?: () => void;
  onOpenDsrCalendar?: () => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORY_TINT: Record<string, { label: string; kindClass: string; dotColor: string }> = {
  Submission: {
    label: "Submissions & Gov",
    kindClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
    dotColor: "#0284c7",
  },
  Inspection: {
    label: "RFWI Inspections",
    kindClass: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40",
    dotColor: "#0d9488",
  },
  Test: {
    label: "Testing Records",
    kindClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
    dotColor: "#7c3aed",
  },
};

export function QAQCCalendar({ records, onSelectRecord, onOpenNewRecord, onOpenDsrCalendar }: Props) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [filter, setFilter] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayIso = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(todayIso);
  const [mobileTab, setMobileTab] = useState<"calendar" | "agenda">("calendar");

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleString("en-MY", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  function shiftMonth(delta: number) {
    setCurrentDate(new Date(year, month + delta, 1));
  }

  function goToday() {
    const [y, m] = todayIso.split("-").map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setSelectedDay(todayIso);
  }

  // Map events by date (prefer dueDate, fallback recordDate)
  const byDate = useMemo(() => {
    const map = new Map<string, RecordRow[]>();
    for (const r of records) {
      const d = r.dueDate || r.recordDate;
      if (d && d.length >= 10) {
        const key = d.slice(0, 10);
        const list = map.get(key) || [];
        list.push(r);
        map.set(key, list);
      }
    }
    return map;
  }, [records]);

  // Calendar cells for Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay(); // 0 is Sun
  const firstDayMondayOffset = (rawFirstDay + 6) % 7; // 0 is Mon, 6 is Sun

  const cells = useMemo(() => {
    const result: Array<{ day: number; iso: string; isWeekend: boolean } | null> = [];
    for (let i = 0; i < firstDayMondayOffset; i++) {
      result.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      // SDSB site schedule: Sabtu kerja, cuti Ahad sahaja (dayOfWeek === 0)
      const isWeekend = dayOfWeek === 0;
      result.push({ day: d, iso, isWeekend });
    }
    return result;
  }, [year, month, daysInMonth, firstDayMondayOffset]);

  // Counts for the current visible month
  const monthStats = useMemo(() => {
    let total = 0;
    let submission = 0;
    let inspection = 0;
    let test = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const list = byDate.get(iso) || [];
      for (const r of list) {
        total++;
        if (r.category === "Submission") submission++;
        else if (r.category === "Inspection") inspection++;
        else if (r.category === "Test") test++;
      }
    }
    return { total, submission, inspection, test };
  }, [year, month, daysInMonth, byDate]);

  // Records for selected day with filter applied
  const dayAllRecords = byDate.get(selectedDay) || [];
  const dayFilteredRecords = useMemo(() => {
    if (filter === "all") return dayAllRecords;
    return dayAllRecords.filter((r) => r.category === filter);
  }, [dayAllRecords, filter]);

  function formattedDayHeading(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("en-MY", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0 rounded-2xl border border-line bg-paper-elevated shadow-sm overflow-hidden text-ink">
      {/* 1. Header KLC Style */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3 border-b border-line bg-paper/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent shadow-xs">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-ink flex items-center gap-2">
              QAQC Calendar & Schedule
            </h2>
            <p className="text-[11px] text-muted">
              Target dates for lab tests, RFWI inspections & SDSB submissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month control */}
          <div className="flex items-center rounded-lg border border-line bg-paper px-1 py-0.5 shadow-xs">
            <span className="px-2 text-xs font-bold text-ink whitespace-nowrap">
              {monthLabel}
            </span>
            <div className="flex items-center border-l border-line pl-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="grid h-6 w-6 place-items-center rounded hover:bg-field text-muted hover:text-ink cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="grid h-6 w-6 place-items-center rounded hover:bg-field text-muted hover:text-ink cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink shadow-xs hover:bg-field cursor-pointer"
          >
            Today
          </button>

          {onOpenDsrCalendar && (
            <button
              type="button"
              onClick={onOpenDsrCalendar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-300 shadow-xs hover:bg-teal-500/25 transition cursor-pointer"
              title="Buka Kalendar DSR & Log Aktiviti Harian Staf"
            >
              <FileText className="h-3.5 w-3.5 text-accent" />
              <span>Calendar DSR</span>
            </button>
          )}

          {onOpenNewRecord && (
            <button
              type="button"
              onClick={onOpenNewRecord}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-accent-bright transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ New Register</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-line/60 bg-paper/20 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              filter === "all"
                ? "bg-accent text-white shadow-xs"
                : "border border-line bg-paper/60 text-muted hover:text-ink"
            }`}
          >
            <span>All</span>
            <span className="opacity-80">({monthStats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("Submission")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              filter === "Submission"
                ? "bg-sky-600 text-white shadow-xs"
                : "border border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 hover:opacity-80"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <span>Submissions ({monthStats.submission})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("Inspection")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              filter === "Inspection"
                ? "bg-teal-600 text-white shadow-xs"
                : "border border-teal-200 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300 hover:opacity-80"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span>RFWI ({monthStats.inspection})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("Test")}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              filter === "Test"
                ? "bg-purple-600 text-white shadow-xs"
                : "border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 hover:opacity-80"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span>Lab Tests ({monthStats.test})</span>
          </button>
        </div>

        <span className="text-[11px] text-muted">
          {monthStats.total} active records in {monthLabel}
        </span>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex items-center justify-center p-2 border-b border-line bg-paper/50 lg:hidden shrink-0">
        <div className="inline-flex rounded-lg border border-line bg-field p-0.5 w-full max-w-xs text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTab("calendar")}
            className={`flex-1 py-1 rounded-md transition text-center cursor-pointer ${
              mobileTab === "calendar" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Calendar Grid
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("agenda")}
            className={`flex-1 py-1 rounded-md transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileTab === "agenda" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <span>Daily Agenda</span>
            <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] text-accent">
              {dayFilteredRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Grid: Kalendar Kiri + Daily Agenda Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] flex-1 min-h-0 overflow-hidden">
        {/* Month Calendar Grid */}
        <div
          className={`p-2 sm:p-4 flex-col justify-between border-b lg:border-b-0 lg:border-r border-line h-full min-h-0 overflow-hidden ${
            mobileTab === "calendar" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted mb-1.5 uppercase tracking-wider shrink-0">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-0.5">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid - 6 equal rows */}
          <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0">
            {cells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-full rounded-lg bg-paper/20 opacity-30"
                  />
                );
              }

              const allDayList = byDate.get(cell.iso) || [];
              const dayList =
                filter === "all"
                  ? allDayList
                  : allDayList.filter((r) => r.category === filter);
              const count = dayList.length;
              const isToday = cell.iso === todayIso;
              const isSelected = cell.iso === selectedDay;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => {
                    setSelectedDay(cell.iso);
                    if (typeof window !== "undefined" && window.innerWidth < 1024 && count > 0) {
                      setMobileTab("agenda");
                    }
                  }}
                  className={`group relative flex flex-col justify-between rounded-lg p-1 text-left transition cursor-pointer h-full min-h-0 overflow-hidden ${
                    isSelected
                      ? "border-2 border-accent bg-accent/10 shadow-xs ring-1 ring-accent"
                      : isToday
                        ? "border border-accent/80 bg-accent/5 font-semibold text-accent"
                        : cell.isWeekend
                          ? "border border-line/60 bg-paper/30 hover:bg-paper/80"
                          : "border border-line bg-paper/60 hover:bg-paper"
                  }`}
                >
                  <div className="flex items-center justify-between w-full shrink-0">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-md text-[11px] font-bold ${
                        isSelected
                          ? "bg-accent text-white"
                          : isToday
                            ? "bg-accent/20 text-accent"
                            : "text-ink group-hover:text-accent"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-accent/20 px-1 py-0.2 text-[9px] font-extrabold text-accent">
                        {count}
                      </span>
                    )}
                  </div>

                  {/* Previews / Indicators (Fixed height strip) */}
                  <div className="w-full mt-auto space-y-0.5 shrink-0 overflow-hidden">
                    {count > 0 && (
                      <div className="flex items-center gap-1">
                        {dayList.slice(0, 3).map((r, i) => {
                          const meta = CATEGORY_TINT[r.category] || { dotColor: "#087f8c" };
                          return (
                            <span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: meta.dotColor }}
                              title={`${r.refNo} (${r.category})`}
                            />
                          );
                        })}
                        {count > 3 && (
                          <span className="text-[8px] text-muted font-bold leading-none">
                            +{count - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Preview chip on slightly wider screens */}
                    {dayList[0] && (
                      <p className="hidden sm:block text-[9px] font-semibold text-muted truncate leading-tight">
                        {dayList[0].refNo}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom legend */}
          <div className="mt-2 pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>Submission / Gov</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span>RFWI</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Testing</span>
              </span>
            </div>
            <span>Malaysia Time (MYT)</span>
          </div>
        </div>

        {/* Daily Agenda Panel (Right Column inside Calendar Box) */}
        <div
          className={`flex-col bg-paper/30 p-3 sm:p-4 h-full min-h-0 overflow-hidden ${
            mobileTab === "agenda" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/70 pb-2 mb-2 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Daily Agenda
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-ink truncate">
                {formattedDayHeading(selectedDay)}
              </h3>
            </div>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
              {dayFilteredRecords.length} {dayFilteredRecords.length === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Scrollable list with fixed boundaries */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {dayFilteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-3 text-muted">
                <CheckCircle2 className="h-8 w-8 text-accent/50 mb-2" />
                <p className="text-xs font-bold text-ink">No Scheduled Records</p>
                <p className="text-[11px] mt-0.5 max-w-[220px]">
                  {dayAllRecords.length > 0
                    ? "Switch the filter above to view records in other categories on this date."
                    : "No RFWI inspections, lab tests, or deadlines scheduled for today."}
                </p>
                {onOpenNewRecord && (
                  <button
                    type="button"
                    onClick={onOpenNewRecord}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent/20 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Register New Document</span>
                  </button>
                )}
              </div>
            ) : (
              dayFilteredRecords.map((r) => {
                const meta = CATEGORY_TINT[r.category] || {
                  label: r.category,
                  kindClass: "bg-paper text-ink border-line",
                  dotColor: "#087f8c",
                };
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRecord(r)}
                    className="w-full text-left rounded-xl border border-line bg-paper p-2.5 shadow-2xs hover:border-accent/60 hover:shadow-xs transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold font-mono text-xs text-accent group-hover:text-accent-bright whitespace-nowrap tracking-tight">
                        {r.refNo}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold border whitespace-nowrap shrink-0 ${meta.kindClass}`}
                      >
                        {r.subcategory || r.category}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug">
                      {r.title}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted gap-2">
                      <span className="truncate">{r.location || r.discipline || "Banting Technology Park (BTP)"}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold whitespace-nowrap shrink-0 ${
                          r.state === "closed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
