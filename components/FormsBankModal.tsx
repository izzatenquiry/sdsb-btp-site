"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_TITLE_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_BTN_CANCEL_CLASS,
} from "./CenteredModal";
import {
  GOVERNANCE_FORMS,
  type GovernanceFormCategory,
  type GovernanceFormTemplate,
} from "@/lib/governance-forms";
import type { RecordRow } from "./RecordModal";

type Props = {
  open: boolean;
  onClose: () => void;
  registerRecords?: RecordRow[];
  onOpenPdfViewer: (template: GovernanceFormTemplate, record?: RecordRow | null) => void;
};

export function FormsBankModal({
  open,
  onClose,
  registerRecords = [],
  onOpenPdfViewer,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GovernanceFormCategory>("ALL");

  const categories: Array<{ id: GovernanceFormCategory; label: string }> = [
    { id: "ALL", label: "All Forms (14)" },
    { id: "INSPECTION", label: "Inspection (RFWI / CHK / ITP)" },
    { id: "SUBMISSION", label: "Submissions (MAF / MOS / DLS)" },
    { id: "NCR_QUALITY", label: "NCR & Quality" },
    { id: "GOVERNANCE", label: "Governance & Minutes" },
    { id: "SAFETY_EHS", label: "Safety (EHS RA)" },
  ];

  const filteredForms = useMemo(() => {
    return GOVERNANCE_FORMS.filter((f) => {
      const matchCat = selectedCategory === "ALL" || f.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        f.code.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="forms-bank-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Modal Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-gradient-to-r from-navy via-slate-800 to-navy px-5 py-4 text-white">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              BTP Quality Governance
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              14 Standard Templates
            </span>
            <span className="rounded border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              1:1 Exact PDF Output
            </span>
          </div>

          <h2 id="forms-bank-title" className="display mt-1 text-lg font-bold tracking-wide text-white sm:text-xl">
            BTP Governance Form Bank & PDF Engine
          </h2>

          <p className="mt-0.5 text-xs text-slate-300 leading-snug">
            Official standardized project forms for <strong>SDSB · Banting Technology Park (BTP)</strong>. Generate 1:1 exact A4 PDF outputs or download original template files (.xlsx / .docx).
          </p>
        </div>

        {/* Stakeholder Logos & Close Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-1 border border-white/15">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Stakeholders:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-white rounded px-1.5 py-0.5" title="SDSB">
                <img src="/logo/SDSB.png" alt="SDSB" className="h-4 w-auto object-contain" />
              </div>
              <div className="flex items-center bg-white rounded px-1.5 py-0.5" title="Turner">
                <img src="/logo/TURNER.png" alt="Turner" className="h-3.5 w-auto object-contain" />
              </div>
              <div className="flex items-center bg-white rounded px-1.5 py-0.5" title="DAYONE">
                <img src="/logo/DAYONE.png" alt="DAYONE" className="h-3.5 w-auto object-contain" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer text-sm font-bold border border-transparent hover:border-white/20 shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="shrink-0 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-line bg-paper/70 px-5 py-3 backdrop-blur-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search forms by Code (e.g. RFWI, MAF, NCR) or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-field pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-paper text-muted hover:text-ink hover:bg-field border border-line"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Form Cards Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="flex flex-col justify-between rounded-xl border border-line bg-paper-elevated p-4 shadow-xs transition hover:border-accent/50 hover:shadow-md group"
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-accent group-hover:text-accent-bright transition">
                    {form.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                      {form.revision}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        form.fileFormat === "xlsx"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : form.fileFormat === "docx"
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          : "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                      }`}
                    >
                      .{form.fileFormat}
                    </span>
                  </div>
                </div>

                {/* Form Title */}
                <h4 className="font-bold text-xs sm:text-sm text-ink group-hover:text-accent transition leading-snug">
                  {form.title}
                </h4>

                <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-3">
                  {form.description}
                </p>
              </div>

              {/* Card Footer & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted">
                  {form.date}
                </span>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`/api/templates/download?file=${encodeURIComponent(form.filename)}`}
                    download
                    title={`Download Original Template File (.${form.fileFormat})`}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-1 text-xs font-semibold text-muted hover:text-ink hover:border-accent transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Original</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenPdfViewer(form)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:brightness-110 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Generate PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="rounded-xl border border-line bg-paper p-8 text-center text-muted">
            <p className="text-sm font-semibold">No forms found matching "{search}".</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-line bg-paper/95 p-3 sm:px-6 w-full text-xs text-muted">
        <span className="text-[11px] text-center sm:text-left">
          Showing {filteredForms.length} of {GOVERNANCE_FORMS.length} standardized governance templates
        </span>
        <button
          type="button"
          onClick={onClose}
          className={`${MODAL_BTN_CANCEL_CLASS} w-full sm:w-auto text-center inline-flex items-center justify-center`}
        >
          Close
        </button>
      </div>
    </CenteredModal>
  );
}
