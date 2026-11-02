"use client";

import { useRef } from "react";
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
import { Printer, Download, Stamp, CheckCircle2, ShieldCheck } from "lucide-react";
import { DsrRecord } from "@/lib/daily-reports";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "dsr" | "monthly-personal" | "compiled-report";
  dsr?: DsrRecord | null;
  monthlyData?: {
    year: number;
    month: number;
    userName: string;
    userRole: string;
    activities: Record<string, any>;
  } | null;
  compiledReport?: any | null;
};

export function DsrReportPrintViewerModal({
  open,
  onClose,
  mode,
  dsr,
  monthlyData,
  compiledReport,
}: Props) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  function handlePrint() {
    window.print();
  }

  const title =
    mode === "dsr"
      ? `Daily Site Report · ${dsr?.refNo || "DSR"}`
      : mode === "monthly-personal"
      ? `Monthly Personal Daily Report · ${monthlyData?.month}/${monthlyData?.year}`
      : `Compiled Report · ${compiledReport?.title || "WPR / MPR"}`;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="dsr-print-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Header */}
      <div className={`${MODAL_HEADER_CLASS} print:hidden`}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white font-black text-base shadow-md">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h3 id="dsr-print-title" className={MODAL_TITLE_CLASS}>
              {title}
            </h3>
            <p className={MODAL_SUBTITLE_CLASS}>
              Official SDSB Quality Documentation · 1:1 High-Resolution Print Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_CLASS}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Printable Sheet Body */}
      <div className={`${MODAL_BODY_CLASS} p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 overflow-y-auto`}>
        <div
          ref={printContentRef}
          className="mx-auto w-full max-w-[850px] bg-white text-black p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 font-sans text-xs space-y-4 print:p-0 print:border-none print:shadow-none print:max-w-none"
        >
          {/* Top Company Header & Logo */}
          <div className="flex items-start justify-between border-b-2 border-black pb-3">
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                SHENGDING CONSTRUCTION SDN BHD
              </h1>
              <p className="text-[10px] font-semibold text-slate-700 tracking-wider">
                COMPANY REG NO: 1389421-V · MAIN CONTRACTOR & PROJECT MANAGEMENT
              </p>
              <p className="text-[9px] text-slate-600 mt-0.5">
                BANTING TECHNOLOGY PARK (BTP) · LOT 1288, MUKIM TANJUNG DUABELAS, KUALA LANGAT, SELANGOR
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-black bg-slate-100 px-2 py-1 font-mono text-[10px] font-extrabold uppercase">
                QAQC CONTROL
              </span>
              <p className="text-[9px] text-slate-500 mt-1 font-mono">
                FORM: SDSB-BTP-DSR-REV2
              </p>
            </div>
          </div>

          {/* Mode 1: Daily Site Report */}
          {mode === "dsr" && dsr && (
            <div className="space-y-3.5">
              {/* Report Title & Ref */}
              <div className="flex items-center justify-between bg-slate-100 p-2 border border-slate-400">
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  DAILY SITE REPORT (DSR)
                </span>
                <span className="font-mono font-bold text-xs">
                  REF NO: {dsr.refNo}
                </span>
              </div>

              {/* Metadata Table */}
              <table className="w-full border-collapse border border-black text-[11px]">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-1/4 p-1.5 font-bold bg-slate-100 border-r border-black">PROJECT</td>
                    <td className="w-1/4 p-1.5 border-r border-black font-semibold">{dsr.location}</td>
                    <td className="w-1/4 p-1.5 font-bold bg-slate-100 border-r border-black">DATE & SHIFT</td>
                    <td className="w-1/4 p-1.5 font-mono font-semibold">{dsr.date} ({dsr.shift.split(" ")[0]})</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 font-bold bg-slate-100 border-r border-black">ZONE / LOCATION</td>
                    <td className="p-1.5 border-r border-black font-semibold">{dsr.subLocation}</td>
                    <td className="p-1.5 font-bold bg-slate-100 border-r border-black">WEATHER</td>
                    <td className="p-1.5">AM: {dsr.weatherAm} | PM: {dsr.weatherPm}</td>
                  </tr>
                </tbody>
              </table>

              {/* Works & Activities */}
              <div className="border border-black p-2.5 space-y-1">
                <p className="font-bold uppercase text-[10px] text-slate-700">1. DESCRIPTION OF WORKS</p>
                <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{dsr.descriptionOfWorks}</p>
              </div>

              <div className="border border-black p-2.5 space-y-1">
                <p className="font-bold uppercase text-[10px] text-slate-700">2. SITE ACTIVITIES & SEQUENCES</p>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{dsr.activities || "—"}</p>
              </div>

              {/* Plant & Manpower 2-Col Table */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-black p-2">
                  <p className="font-bold uppercase text-[10px] text-slate-700 mb-1">3. PLANT & MACHINERY DEPLOYED</p>
                  <p className="leading-snug">{dsr.plant || "—"}</p>
                </div>
                <div className="border border-black p-2">
                  <p className="font-bold uppercase text-[10px] text-slate-700 mb-1">4. MANPOWER HEADCOUNT</p>
                  <p className="leading-snug">{dsr.manpower || "—"}</p>
                </div>
              </div>

              {/* QAQC & HSSE */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-black p-2">
                  <p className="font-bold uppercase text-[10px] text-slate-700 mb-1">5. QAQC INSPECTION & COMPLIANCE</p>
                  <p className="leading-snug">{dsr.qaqcNotes || "—"}</p>
                  {dsr.materials && (
                    <p className="text-[10px] text-slate-600 mt-1.5 border-t border-slate-300 pt-1">
                      <strong>Materials:</strong> {dsr.materials}
                    </p>
                  )}
                </div>
                <div className="border border-black p-2">
                  <p className="font-bold uppercase text-[10px] text-slate-700 mb-1">6. HSSE & WEATHER CONSTRAINTS</p>
                  <p className="leading-snug">{dsr.hsseNotes || "—"}</p>
                  {dsr.constraints && (
                    <p className="text-[10px] text-slate-600 mt-1.5 border-t border-slate-300 pt-1">
                      <strong>Constraints:</strong> {dsr.constraints}
                    </p>
                  )}
                </div>
              </div>

              {/* Tomorrow Plan */}
              {dsr.tomorrowPlan && (
                <div className="border border-black p-2 text-[11px]">
                  <p className="font-bold uppercase text-[10px] text-slate-700">7. TOMORROW / NEXT SHIFT PLAN</p>
                  <p className="leading-snug">{dsr.tomorrowPlan}</p>
                </div>
              )}

              {/* Photos Grid (if any) */}
              {dsr.photos && dsr.photos.length > 0 && (
                <div className="border border-black p-2 space-y-2">
                  <p className="font-bold uppercase text-[10px] text-slate-700">8. SITE PROGRESS EVIDENCE PHOTOS</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dsr.photos.map((p, idx) => (
                      <div key={p.id || idx} className="border border-slate-300 p-1 rounded">
                        <img src={p.url} alt={p.caption} className="h-24 w-full object-cover" />
                        <p className="text-[9px] font-semibold mt-1 truncate">{p.caption}</p>
                        <p className="text-[8px] text-slate-500">{p.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures & Stamp Block */}
              <div className="grid grid-cols-2 gap-4 border border-black p-3 pt-4 mt-4">
                <div className="space-y-8">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">PREPARED BY (MAIN CONTRACTOR SDSB):</p>
                  <div className="border-b border-black w-48 font-serif italic text-sm text-slate-800">
                    {dsr.preparedBy}
                  </div>
                  <div>
                    <p className="font-bold text-[11px] text-slate-900">{dsr.preparedBy}</p>
                    <p className="text-[9px] text-slate-600">QAQC DC</p>
                    <p className="text-[9px] text-slate-500">SHENGDING CONSTRUCTION SDN BHD</p>
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {/* SDSB Official 3.0cm Chop Badge */}
                  <div className="absolute top-2 right-4 h-16 w-16 rounded-full border-2 border-dashed border-teal-700/60 flex flex-col items-center justify-center text-center text-teal-800 font-bold text-[7px] leading-tight rotate-12">
                    <span>SDSB QAQC</span>
                    <span className="text-[9px]">★</span>
                    <span>OFFICIAL</span>
                  </div>

                  <p className="text-[10px] font-bold text-slate-600 uppercase">VERIFIED & WITNESSED BY (CONSULTANT RE):</p>
                  <div className="border-b border-black w-48 font-serif italic text-sm text-slate-800">
                    {dsr.verifiedBy}
                  </div>
                  <div>
                    <p className="font-bold text-[11px] text-slate-900">{dsr.verifiedBy}</p>
                    <p className="text-[9px] text-slate-600">Resident Engineer (Civil & Structural)</p>
                    <p className="text-[9px] text-slate-500">KL Consult Associates · BTP Supervision</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Monthly Personal Report */}
          {mode === "monthly-personal" && monthlyData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-100 p-2 border border-slate-400">
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  MONTHLY PERSONAL DAILY REPORT & ACTIVITY LOG
                </span>
                <span className="font-mono font-bold text-xs">
                  MONTH: {monthlyData.month}/{monthlyData.year}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border border-black p-2 bg-slate-50">
                <div>
                  <p><strong>Staff Name:</strong> {monthlyData.userName}</p>
                  <p><strong>Designation:</strong> {monthlyData.userRole}</p>
                </div>
                <div>
                  <p><strong>Company:</strong> SHENGDING CONSTRUCTION SDN BHD (SDSB)</p>
                  <p><strong>Project:</strong> Banting Technology Park (BTP)</p>
                </div>
              </div>

              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-200 border-b border-black text-slate-900">
                    <th className="p-1 border-r border-black w-10 text-center">Day</th>
                    <th className="p-1 border-r border-black w-24">Date</th>
                    <th className="p-1 border-r border-black">Daily Activities / Inspections Conducted</th>
                    <th className="p-1 border-r border-black w-20 text-center">DSR Ref</th>
                    <th className="p-1 w-16 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateIso = `${monthlyData.year}-${String(monthlyData.month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const entry = monthlyData.activities[dateIso];
                    const dayOfWeek = new Date(monthlyData.year, monthlyData.month - 1, dayNum).getDay();
                    const isSundayOff = dayOfWeek === 0; // SDSB site: Sabtu kerja, cuti Ahad sahaja

                    if (idx >= 28 && new Date(monthlyData.year, monthlyData.month - 1, dayNum).getMonth() !== monthlyData.month - 1) {
                      return null;
                    }

                    return (
                      <tr key={dateIso} className={`border-b border-slate-300 ${isSundayOff ? "bg-slate-50" : ""}`}>
                        <td className="p-1 border-r border-black text-center font-bold">{dayNum}</td>
                        <td className="p-1 border-r border-black font-mono">{dateIso}</td>
                        <td className="p-1 border-r border-black">
                          {entry?.workDescription || (isSundayOff ? "Sunday / Off (Weekly Rest Day)" : "—")}
                        </td>
                        <td className="p-1 border-r border-black text-center font-mono text-[9px]">
                          {entry?.dsr?.refNo?.slice(-8) || "—"}
                        </td>
                        <td className="p-1 text-center font-bold text-emerald-700">
                          {entry?.workDescription ? "Logged" : isSundayOff ? "Rest" : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 border border-black p-3 pt-6 mt-4">
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">SUBMITTED BY STAFF:</p>
                  <p className="font-serif italic text-sm">{monthlyData.userName}</p>
                  <div>
                    <p className="font-bold text-[11px]">{monthlyData.userName}</p>
                    <p className="text-[9px] text-slate-600">{monthlyData.userRole}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">APPROVED BY PROJECT MANAGER:</p>
                  <p className="font-serif italic text-sm">Mr. Tan Wei Lun</p>
                  <div>
                    <p className="font-bold text-[11px]">Mr. Tan Wei Lun</p>
                    <p className="text-[9px] text-slate-600">Project Manager · SDSB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Compiled WPR / MPR Report */}
          {mode === "compiled-report" && compiledReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 border border-slate-400">
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  {compiledReport.title}
                </span>
                <span className="font-mono font-bold text-xs">
                  {compiledReport.dateRange || compiledReport.monthYear}
                </span>
              </div>

              <div className="border border-black p-3 space-y-2">
                <p className="font-bold text-xs uppercase text-slate-800">EXECUTIVE SUMMARY</p>
                <p className="text-xs leading-relaxed">{compiledReport.summary}</p>
              </div>

              <div className="border border-black p-3 space-y-2">
                <p className="font-bold text-xs uppercase text-slate-800">
                  COMPILED DAILY SITE REPORTS ({compiledReport.dsrs?.length || 0} TOTAL)
                </p>
                <table className="w-full border-collapse border border-black text-[10px]">
                  <thead>
                    <tr className="bg-slate-200 border-b border-black">
                      <th className="p-1 border-r border-black w-24">Date</th>
                      <th className="p-1 border-r border-black w-36">DSR Ref</th>
                      <th className="p-1 border-r border-black w-40">Zone</th>
                      <th className="p-1 border-r border-black">Works Conducted</th>
                      <th className="p-1 w-20 text-center">QAQC Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compiledReport.dsrs && compiledReport.dsrs.length > 0 ? (
                      compiledReport.dsrs.map((d: any) => (
                        <tr key={d.id} className="border-b border-slate-300">
                          <td className="p-1 border-r border-black font-mono">{d.date}</td>
                          <td className="p-1 border-r border-black font-mono font-bold">{d.refNo}</td>
                          <td className="p-1 border-r border-black">{d.subLocation.split("·")[0]}</td>
                          <td className="p-1 border-r border-black">{d.descriptionOfWorks}</td>
                          <td className="p-1 text-center font-bold text-emerald-700">{d.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-slate-500">
                          No DSR records attached for this range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Progress Photos Gallery in Compiled Report */}
              {compiledReport.photos && compiledReport.photos.length > 0 && (
                <div className="border border-black p-3 space-y-2">
                  <p className="font-bold text-xs uppercase text-slate-800">KEY PROGRESS PHOTOS</p>
                  <div className="grid grid-cols-3 gap-2">
                    {compiledReport.photos.slice(0, 6).map((p: any, idx: number) => (
                      <div key={idx} className="border border-slate-300 p-1">
                        <img src={p.url} alt={p.caption} className="h-28 w-full object-cover" />
                        <p className="text-[9px] font-semibold mt-1 truncate">{p.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Sign-off */}
              <div className="grid grid-cols-2 gap-4 border border-black p-3 pt-6 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">COMPILED BY:</p>
                  <p className="font-serif italic text-sm mt-4">{compiledReport.compiledBy}</p>
                  <p className="font-bold text-[11px] mt-1">{compiledReport.compiledBy}</p>
                  <p className="text-[9px] text-slate-600">QAQC DC</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">ACKNOWLEDGED BY CONSULTANT RE:</p>
                  <p className="font-serif italic text-sm mt-4 min-h-[1.25rem]">{compiledReport.verifiedBy || ""}</p>
                  <p className="font-bold text-[11px] mt-1">{compiledReport.verifiedBy || "(Belum Ditandatangani)"}</p>
                  <p className="text-[9px] text-slate-600">Resident Engineer (Civil & Structural)</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[9px] text-slate-500">
            <span>SHENGDING CONSTRUCTION SDN BHD · CONFIDENTIAL</span>
            <span>Generated from BTP QAQC Control Centre</span>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
