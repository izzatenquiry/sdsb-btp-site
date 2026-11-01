"use client";

import { useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import type { RecordRow } from "./RecordModal";
import { Search, Filter, Layers, Clock, Calendar, FileCheck2 } from "lucide-react";
import { hasScancopySync } from "@/lib/scancopy-storage";

type Props = {
  open: boolean;
  title: string;
  bucketType: "pending" | "overdue" | "all";
  rows: RecordRow[];
  onClose: () => void;
  onSelectRow: (row: RecordRow) => void;
};

export function BucketModal({
  open,
  title,
  bucketType,
  rows,
  onClose,
  onSelectRow,
}: Props) {
  const [search, setSearch] = useState("");

  const bucketLabel =
    bucketType === "overdue"
      ? "Overdue"
      : bucketType === "pending"
        ? "Pending"
        : "All";

  const filteredRows = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.refNo || "").toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q) ||
      (r.status || "").toLowerCase().includes(q) ||
      (r.subcategory || "").toLowerCase().includes(q)
    );
  });

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="bucket-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white font-black text-sm shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 id="bucket-modal-title" className={MODAL_TITLE_CLASS}>
                {bucketLabel} — {title}
              </h4>
              <span className="rounded-full bg-accent/15 border border-accent/25 px-2 py-0.5 text-[10px] font-bold text-accent">
                {rows.length} records
              </span>
            </div>
            <p className={MODAL_SUBTITLE_CLASS}>
              Filtered drilldown breakdown · Click any record to open official form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Cari no rujukan / tajuk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-line bg-paper pl-8 pr-3 py-1.5 text-xs text-ink outline-none focus:border-accent w-48 sm:w-60"
            />
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
            <Layers className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No records found</p>
            <p className="text-xs">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectRow(r);
                }}
                className="text-left rounded-xl border border-line bg-paper p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xs cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-accent group-hover:underline truncate">
                        {r.refNo}
                      </span>
                      {hasScancopySync(r.refNo) && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 px-1 py-0.2 text-[8.5px] font-bold">
                          <FileCheck2 className="h-2.5 w-2.5" />
                          PDF
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        (r.status || "").toLowerCase().includes("closed") ||
                        (r.status || "").toLowerCase().includes("passed")
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink line-clamp-2 mb-2 leading-tight">
                    {r.title}
                  </p>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[10.5px] text-muted font-medium">
                  <span className="truncate max-w-[140px]">{r.subcategory}</span>
                  {r.dueDate && (
                    <span className="flex items-center gap-1 font-mono text-[9.5px]">
                      <Calendar className="h-3 w-3" />
                      {r.dueDate}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CenteredModal>
  );
}
