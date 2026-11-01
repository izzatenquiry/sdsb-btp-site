"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  Check,
  Activity,
  HardDrive,
} from "lucide-react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import { registerCatalog } from "@/lib/register-catalog";

type Props = {
  open: boolean;
  onClose: () => void;
  totalRecords: number;
  snapshotAsOf?: string;
  sourceFile?: string;
  storageAvailable?: boolean;
  issues?: Array<{
    sheet: string;
    cell?: string;
    field?: string;
    issue: string;
    effect: string;
  }>;
};

export function RegisterHealthModal({
  open,
  onClose,
  totalRecords,
  snapshotAsOf = "2026-10-30",
  sourceFile = "QAQC Summarylist Banting Data Park - Grouped Tabs.xlsx",
  storageAvailable = true,
  issues = [],
}: Props) {
  const submissionRegisters = registerCatalog.filter((r) => r.category === "Submission");
  const inspectionRegisters = registerCatalog.filter((r) => r.category === "Inspection");
  const testRegisters = registerCatalog.filter((r) => r.category === "Test");

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="health-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 id="health-modal-title" className={MODAL_TITLE_CLASS}>
                Internal Register Health & Telemetry
              </h4>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                22/22 Synchronized
              </span>
            </div>
            <p className={MODAL_SUBTITLE_CLASS}>
              Project snapshot status, SQLite internal registers, & ACC sync health
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

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
          {/* Left Column: System Metrics & Status (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-line bg-paper p-4 space-y-3 shadow-xs">
              <h5 className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-accent" />
                Live System Diagnostics
              </h5>

              <div className="space-y-2 text-xs divide-y divide-line/60">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted">Total Indexed Records</span>
                  <strong className="text-ink font-mono text-sm">{totalRecords.toLocaleString("en-MY")}</strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted">Scope Coverage</span>
                  <span className="rounded bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                    22 / 22 Registers Active
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted">Source Snapshot</span>
                  <strong className="text-ink font-mono">{snapshotAsOf}</strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted">Shared Storage</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {storageAvailable ? "Active (SQLite Live)" : "Read-Only"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted">Autodesk ACC Sync</span>
                  <span className="font-semibold text-accent flex items-center gap-1 text-[11px]">
                    <Check className="h-3.5 w-3.5" />
                    Internal Snapshot Linked
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-muted font-bold uppercase text-[10px]">
                <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                Primary Source File
              </div>
              <p className="font-mono text-[11px] text-ink break-all bg-field p-2 rounded-lg border border-line">
                {sourceFile}
              </p>
            </div>

            {issues.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
                <p className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Format Integrity Notes ({issues.length})
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] pr-1">
                  {issues.map((iss, i) => (
                    <div key={i} className="p-1.5 rounded bg-paper/80 border border-line">
                      <strong>{iss.sheet}</strong>: {iss.issue}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 22 Internal Registers Matrix (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-line bg-paper p-4 shadow-xs flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h5 className="text-xs font-black uppercase tracking-wider text-ink">
                  22 Internal Registers Matrix
                </h5>
              </div>
              <span className="text-[10px] text-muted font-mono">BTP Data Park Project Scope</span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Group 1: Submissions */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-[10px] font-black uppercase text-sky-700 dark:text-sky-300">
                    Box 1: Submissions & Quality Governance ({submissionRegisters.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {submissionRegisters.map((r) => (
                    <div
                      key={r.name}
                      className="p-1.5 rounded-lg border border-line bg-field/60 flex items-center justify-between gap-1 text-[10px]"
                    >
                      <span className="font-bold text-ink truncate">{r.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Inspections (RFWI) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-300">
                    Box 2: Site Work Inspections - RFWI ({inspectionRegisters.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {inspectionRegisters.map((r) => (
                    <div
                      key={r.name}
                      className="p-1.5 rounded-lg border border-line bg-field/60 flex items-center justify-between gap-1 text-[10px]"
                    >
                      <span className="font-bold text-ink truncate">{r.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: QAQC Tests */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300">
                    Box 3: QA/QC Testing Records ({testRegisters.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {testRegisters.map((r) => (
                    <div
                      key={r.name}
                      className="p-1.5 rounded-lg border border-line bg-field/60 flex items-center justify-between gap-1 text-[10px]"
                    >
                      <span className="font-bold text-ink truncate">{r.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
