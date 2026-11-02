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
  Filter,
  ChevronDown,
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

      {/* Modal Header - Clean 1-Line Title */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-paper/80 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-accent to-teal-500 text-white font-bold shadow-xs shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h3 id="forms-bank-title" className="text-sm sm:text-base font-bold text-ink truncate tracking-tight">
              BTP Governance Form Bank
            </h3>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
              14 Templates
            </span>
          </div>
        </div>

        {/* Stakeholder Logos (Desktop) & Close Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-field/80 px-2.5 py-1 border border-line">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Stakeholders:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-white rounded px-1.5 py-0.5 border border-line/60" title="SDSB">
                <img src="/logo/SDSB.png" alt="SDSB" className="h-3.5 w-auto object-contain" />
              </div>
              <div className="flex items-center bg-white rounded px-1.5 py-0.5 border border-line/60" title="Turner">
                <img src="/logo/TURNER.png" alt="Turner" className="h-3 w-auto object-contain" />
              </div>
              <div className="flex items-center bg-white rounded px-1.5 py-0.5 border border-line/60" title="DAYONE">
                <img src="/logo/DAYONE.png" alt="DAYONE" className="h-3 w-auto object-contain" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={MODAL_CLOSE_CLASS}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Dropdown */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 border-b border-line bg-field/30 px-4 py-2 sm:px-6">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search forms by Code (e.g. RFWI, MAF, NCR) or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none shadow-2xs"
          />
        </div>

        {/* Selection Form Dropdown */}
        <div className="relative shrink-0 sm:w-64">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full appearance-none rounded-lg border border-line bg-paper pl-8 pr-8 py-1.5 text-xs font-semibold text-ink focus:border-accent focus:outline-none shadow-2xs cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
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
