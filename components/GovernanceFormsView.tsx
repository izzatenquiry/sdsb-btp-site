"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";
import {
  GOVERNANCE_FORMS,
  type GovernanceFormCategory,
  type GovernanceFormTemplate,
} from "@/lib/governance-forms";
import type { RecordRow } from "./RecordModal";
import { FormPdfViewerModal } from "./FormPdfViewerModal";

type Props = {
  registerRecords: RecordRow[];
  onBackToOverview: () => void;
};

export function GovernanceFormsView({ registerRecords, onBackToOverview }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GovernanceFormCategory>("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState<GovernanceFormTemplate | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [prefilledRecord, setPrefilledRecord] = useState<RecordRow | null>(null);

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

  function handleOpenForm(template: GovernanceFormTemplate, rec?: RecordRow) {
    setSelectedTemplate(template);
    setPrefilledRecord(rec || null);
    setViewerOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* Top Banner / Hero matching KLC-GEMAS-DEPOT */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-navy via-slate-800 to-navy p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                BTP Quality Governance
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                14 Standard Templates
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                1:1 Exact PDF Output
              </span>
            </div>
            <h2 className="display mt-2 text-2xl font-bold tracking-wide text-white sm:text-3xl">
              BTP Governance Form Bank & PDF Engine
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete directory of standardized project forms for <strong>SDSB · Banting Technology Park (BTP)</strong> from the official governance archive. Generate 1:1 exact A4 PDF outputs, auto-fill directly from the 22 Registers, or download original template files (.xlsx / .docx).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-white/15">
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Stakeholders:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded px-2 py-1" title="SDSB">
                  <img src="/logo/SDSB.png" alt="SDSB" className="h-5 w-auto object-contain" />
                </div>
                <div className="flex items-center bg-white rounded px-2 py-1" title="Turner">
                  <img src="/logo/TURNER.png" alt="Turner" className="h-4 w-auto object-contain" />
                </div>
                <div className="flex items-center bg-white rounded px-2 py-1" title="DAYONE">
                  <img src="/logo/DAYONE.png" alt="DAYONE" className="h-4 w-auto object-contain" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToOverview}
              className="rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-white/20 transition cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-line bg-paper/60 p-3.5 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search forms by Code (e.g. RFWI, MAF, NCR) or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-field pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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

      {/* Form Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form) => {
          const isInteractive = form.hasInteractivePdf;
          return (
            <div
              key={form.id}
              className="flex flex-col justify-between rounded-xl border border-line bg-paper p-4 shadow-xs transition hover:border-accent/50 hover:shadow-md group"
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
                <h4 className="font-bold text-sm text-ink group-hover:text-accent transition leading-snug">
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
                    onClick={() => handleOpenForm(form)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:brightness-110 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Generate PDF</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredForms.length === 0 && (
        <div className="rounded-xl border border-line bg-paper p-8 text-center text-muted">
          <p className="text-sm font-semibold">No forms found matching "{search}".</p>
        </div>
      )}

      {/* Form PDF Viewer & Generator Modal */}
      <FormPdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        template={selectedTemplate}
        registerRecords={registerRecords}
        initialRecord={prefilledRecord}
      />
    </div>
  );
}
