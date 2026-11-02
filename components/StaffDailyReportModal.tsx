"use client";

import { useEffect, useMemo, useState } from "react";
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Trash2,
  FileText,
  FileCheck2,
  Plus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  deleteStaffDailyReport,
  getDsrRecords,
  getStaffDailyReports,
  saveStaffDailyReport,
  StaffDailyReportItem,
} from "@/lib/daily-reports";

type Props = {
  open: boolean;
  onClose: () => void;
  userName?: string;
  userRole?: string;
  onOpenCreateDsr?: (initialDate?: string) => void;
  onOpenViewDsr?: (dsrId: string) => void;
  onOpenCompile?: () => void;
  onPrintMonthlyReport?: (year: number, month: number) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const QUICK_CHIPS = [
  { label: "Site Inspection", snippet: "Site inspection at Zone 1 (Block A / B foundations & ground beams)." },
  { label: "RFWI Joint Inspection", snippet: "Attended RFWI joint inspection with Consultant RE & PMC." },
  { label: "Cube Test / Slump Check", snippet: "Witnessed concrete slump testing and cube sampling for G35/G40 casting." },
  { label: "Earthwork Verification", snippet: "Platform levelling and Field Density Test (FDT) verification for roadbase." },
  { label: "Office QAQC Doc", snippet: "Office documentation: reconciled 22 active registers & prepared RFWI batch." },
  { label: "Coordination Meeting", snippet: "Attended site technical coordination meeting with Subcontractors & Consultant." },
  { label: "Material Delivery", snippet: "Inspected incoming rebar Mill Certificates & ready-mix batching tickets." },
  { label: "Sunday Off", snippet: "Sunday / Off (Weekly Rest Day)" },
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function getTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const val = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${val("year")}-${val("month")}-${val("day")}`;
}

function formatDayHeading(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getMonthName(monthNumber: number): string {
  return new Date(2026, monthNumber - 1, 1).toLocaleString("en-MY", {
    month: "long",
  });
}

export function StaffDailyReportModal({
  open,
  onClose,
  userName = "Nur Damia",
  userRole = "QAQC DC",
  onOpenCreateDsr,
  onOpenViewDsr,
  onOpenCompile,
  onPrintMonthlyReport,
}: Props) {
  const todayIso = useMemo(() => getTodayIso(), []);
  const todayParts = useMemo(() => {
    const [y, m, d] = todayIso.split("-").map(Number);
    return { year: y, month: m, day: d };
  }, [todayIso]);

  const [currentYear, setCurrentYear] = useState(todayParts.year);
  const [currentMonth, setCurrentMonth] = useState(todayParts.month);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  const [reports, setReports] = useState<Record<string, StaffDailyReportItem>>({});
  const [editingText, setEditingText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Load reports from storage
  useEffect(() => {
    if (!open) return;
    const data = getStaffDailyReports();
    setReports(data);
  }, [open, currentYear, currentMonth]);

  // Sync editing text when selectedDate changes
  useEffect(() => {
    const entry = reports[selectedDate];
    setEditingText(entry?.workDescription || "");
    setSaveSuccessMsg("");
  }, [selectedDate, reports]);

  // Calendar cells calculation (Monday start)
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Monday = 0, Sunday = 6
    const shift = (firstDayIndex + 6) % 7;

    const cells: Array<{
      dayNumber: number;
      iso: string;
      isWeekend: boolean;
    } | null> = [];

    // Leading blanks
    for (let i = 0; i < shift; i++) {
      cells.push(null);
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${currentYear}-${pad2(currentMonth)}-${pad2(d)}`;
      const dayOfWeek = new Date(currentYear, currentMonth - 1, d).getDay();
      // SDSB site schedule: Sabtu kerja, cuti Ahad sahaja (dayOfWeek === 0)
      const isWeekend = dayOfWeek === 0;
      cells.push({
        dayNumber: d,
        iso,
        isWeekend,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Count logged days in current month
  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${pad2(currentMonth)}-`;
    let logged = 0;
    let dsrCount = 0;
    for (const [date, item] of Object.entries(reports)) {
      if (date.startsWith(prefix)) {
        if (item.workDescription?.trim()) logged++;
        if (item.dsr) dsrCount++;
      }
    }
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    return { logged, dsrCount, daysInMonth };
  }, [reports, currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function jumpToToday() {
    setCurrentYear(todayParts.year);
    setCurrentMonth(todayParts.month);
    setSelectedDate(todayIso);
  }

  function handleSave() {
    setSaving(true);
    const existing = reports[selectedDate];
    const saved = saveStaffDailyReport(selectedDate, editingText.trim(), existing?.dsr);
    setReports((prev) => ({
      ...prev,
      [selectedDate]: saved,
    }));
    setTimeout(() => {
      setSaving(false);
      setSaveSuccessMsg("Activity log saved!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }, 200);
  }

  function handleDelete() {
    if (!editingText && !reports[selectedDate]) return;
    if (!confirm(`Delete activity log for ${selectedDate}?`)) return;
    deleteStaffDailyReport(selectedDate);
    setReports((prev) => {
      const copy = { ...prev };
      delete copy[selectedDate];
      return copy;
    });
    setEditingText("");
    setSaveSuccessMsg("Log removed");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  }

  function handleApplyChip(snippet: string) {
    if (!editingText.trim()) {
      setEditingText(snippet);
    } else if (editingText.includes(snippet)) {
      return;
    } else {
      setEditingText((prev) => `${prev.trim()}\n${snippet}`);
    }
  }

  function handleAutoSummarize() {
    const dsrs = getDsrRecords();
    const matchedDsr = dsrs.find((d) => d.date === selectedDate);
    if (matchedDsr) {
      const summary = `DSR Ref: ${matchedDsr.refNo} (${matchedDsr.subLocation})\n• Works: ${matchedDsr.descriptionOfWorks}\n• Activities: ${matchedDsr.activities.split("\n")[0] || ""}\n• QAQC: ${matchedDsr.qaqcNotes}`;
      setEditingText(summary);
      setSaveSuccessMsg("Imported summary from DSR record!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    } else {
      const fallback = `QAQC Site inspection and documentation for SDSB BTP registers. Verified daily site compliance and material deliveries.`;
      setEditingText(fallback);
      setSaveSuccessMsg("Generated standard QAQC site log.");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  }

  const selectedItem = reports[selectedDate];
  const selectedDsr = selectedItem?.dsr;
  const monthLabel = `${getMonthName(currentMonth)} ${currentYear}`;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="staff-daily-report-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-paper/80 px-3.5 py-2.5 sm:px-6 sm:py-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-accent text-white font-black text-base sm:text-lg shadow-md shrink-0">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="staff-daily-report-title" className="text-sm sm:text-base font-bold text-ink truncate tracking-tight">
              Personal Daily Report & Activity Calendar
            </h3>
            <p className="text-[11px] text-muted truncate mt-0.5">
              {userName} · {userRole} · SHENGDING CONSTRUCTION SDN BHD (SDSB)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-field hover:text-ink transition cursor-pointer text-sm font-bold border border-transparent hover:border-line shrink-0"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className={`${MODAL_BODY_CLASS} p-4 sm:p-5 space-y-4`}>
        {/* Top Control Bar: Month Switcher & Direct Actions (3 Rows) */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-paper/60 p-3 shadow-sm">
          {/* Row 1: Month | Today */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-between sm:justify-start">
              <button
                type="button"
                onClick={prevMonth}
                title="Previous Month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-paper text-ink transition hover:border-accent hover:text-accent cursor-pointer shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h4 className="flex-1 sm:min-w-[11rem] text-center text-sm sm:text-base font-bold text-ink whitespace-nowrap">
                {monthLabel}
              </h4>
              <button
                type="button"
                onClick={nextMonth}
                title="Next Month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-paper text-ink transition hover:border-accent hover:text-accent cursor-pointer shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={jumpToToday}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition cursor-pointer shrink-0 shadow-2xs"
            >
              Today
            </button>
          </div>

          {/* Row 2: Status Pill (Kekal tapi Full Width) */}
          <div className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted bg-paper-elevated px-3 py-1.5 rounded-lg border border-line text-center shadow-2xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {monthStats.logged} / {monthStats.daysInMonth} Days Logged
            </span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {monthStats.dsrCount} DSRs Attached
            </span>
          </div>

          {/* Row 3: + New DSR | Monthly | Compile WPR / MPR */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
            {onOpenCreateDsr && (
              <button
                type="button"
                onClick={() => onOpenCreateDsr(selectedDate)}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-accent px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-xs hover:brightness-110 active:scale-95 transition cursor-pointer text-center whitespace-nowrap"
                title="Create New DSR for Selected Date"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">New DSR</span>
              </button>
            )}

            {onPrintMonthlyReport && (
              <button
                type="button"
                onClick={() => onPrintMonthlyReport(currentYear, currentMonth)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-paper px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-ink hover:border-accent hover:text-accent transition shadow-2xs cursor-pointer text-center whitespace-nowrap"
                title="Print Monthly Activity Sheet"
              >
                <Printer className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="truncate">Monthly</span>
              </button>
            )}

            {onOpenCompile && (
              <button
                type="button"
                onClick={onOpenCompile}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-paper px-1.5 sm:px-3 py-1.5 text-[10.5px] sm:text-xs font-bold text-ink hover:border-accent hover:text-accent transition shadow-2xs cursor-pointer text-center whitespace-nowrap"
                title="Compile Weekly or Monthly Progress Report"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Compile WPR / MPR</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Calendar Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-2 rounded-xl border border-line bg-paper/30 p-3 sm:p-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Monthly Activity Matrix
              </span>
              <span className="text-[11px] text-muted">
                Click any day to view or edit activity
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted py-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd}>{wd}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-14 sm:h-16 rounded-lg border border-transparent bg-field/15"
                      aria-hidden="true"
                    />
                  );
                }

                const isSelected = selectedDate === cell.iso;
                const isToday = todayIso === cell.iso;
                const item = reports[cell.iso];
                const hasEntry = Boolean(item?.workDescription?.trim());
                const hasDsr = Boolean(item?.dsr);

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedDate(cell.iso)}
                    className={`group relative flex h-14 sm:h-16 flex-col justify-between rounded-lg p-1.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "border-2 border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30"
                        : hasDsr
                        ? "border border-indigo-400/80 bg-indigo-50/70 dark:bg-indigo-950/25 hover:border-indigo-500"
                        : hasEntry
                        ? "border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500/60"
                        : cell.isWeekend
                        ? "border border-line/40 bg-field/30 hover:border-line"
                        : "border border-line/70 bg-paper hover:border-accent/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          isToday
                            ? "bg-accent text-white"
                            : isSelected
                            ? "text-accent font-extrabold"
                            : cell.isWeekend
                            ? "text-muted"
                            : "text-ink"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      <div className="flex items-center gap-1">
                        {hasDsr && (
                          <span
                            className="inline-flex items-center rounded bg-indigo-600 px-1 py-0.2 text-[8px] font-extrabold text-white"
                            title={`DSR Attached: ${item?.dsr?.refNo}`}
                          >
                            DSR
                          </span>
                        )}
                        {hasEntry && !hasDsr && (
                          <span
                            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white"
                            title="Activity Logged"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      {item?.workDescription ? (
                        <p className="line-clamp-2 text-[9px] leading-tight text-ink font-medium opacity-85 group-hover:opacity-100">
                          {item.workDescription}
                        </p>
                      ) : cell.isWeekend ? (
                        <span className="text-[9px] text-muted/60">Sunday / Off</span>
                      ) : (
                        <span className="text-[9px] text-muted/50 opacity-0 group-hover:opacity-100">
                          + add
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-2 text-[10px] text-muted">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="rounded bg-indigo-600 px-1 py-0.5 text-[8px] font-bold text-white">DSR</span> Daily Site Report
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Logged
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full border border-line bg-paper" /> Empty
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Today
                </span>
              </div>
              <span className="font-semibold text-ink">BTP QAQC Standard Format</span>
            </div>
          </div>

          {/* Right Column: Daily Activity Editor & DSR Link (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 rounded-xl border border-line bg-paper-elevated p-4 shadow-sm">
            {/* Selected Date Header */}
            <div className="border-b border-line pb-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                    Daily Activity Details
                  </h4>
                  <p className="text-sm font-extrabold text-accent mt-0.5">
                    {formatDayHeading(selectedDate)}
                  </p>
                </div>
                {todayIso === selectedDate && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/20">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* DSR Attached Banner (if any) */}
            {selectedDsr ? (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs dark:bg-indigo-950/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-300">
                      <FileCheck2 className="h-4 w-4" />
                      Attached Daily Site Report
                    </span>
                    <p className="font-mono text-[11px] font-bold text-ink mt-0.5">
                      {selectedDsr.refNo}
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {selectedDsr.location} · {selectedDsr.descriptionOfWorks}
                    </p>
                  </div>
                  {onOpenViewDsr && (
                    <button
                      type="button"
                      onClick={() => onOpenViewDsr(selectedDsr.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-indigo-700 transition cursor-pointer shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View DSR</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-2.5 text-xs">
                <span className="text-[11px] text-muted">No full DSR created yet for this date.</span>
                {onOpenCreateDsr && (
                  <button
                    type="button"
                    onClick={() => onOpenCreateDsr(selectedDate)}
                    className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-1 text-[10px] font-bold text-accent hover:bg-accent/25 transition cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Create DSR</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Chips for rapid insertion */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-ink">
                  Quick Activity Chips
                </label>
                <button
                  type="button"
                  onClick={handleAutoSummarize}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  title="Auto summarize from QAQC registers"
                >
                  <Sparkles className="h-3 w-3 text-teal-500" />
                  <span>Auto-Summarize</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleApplyChip(chip.snippet)}
                    className="rounded-lg border border-line bg-paper px-2 py-1 text-[10px] font-medium text-ink hover:border-accent hover:bg-accent/5 transition cursor-pointer"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Editor */}
            <div>
              <label className="block text-[11px] font-bold text-ink mb-1">
                Work Description & Site Activities
              </label>
              <textarea
                rows={6}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Describe site inspections, QAQC records checked, RFWI witnessed, or concrete tests..."
                className="w-full rounded-xl border border-line bg-field p-2.5 text-xs text-ink outline-none focus:border-accent leading-relaxed"
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                <span>{editingText.length} characters</span>
                {saveSuccessMsg && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {saveSuccessMsg}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-line">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!editingText && !selectedItem}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? "Saving..." : "Save Log"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
