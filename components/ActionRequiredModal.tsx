"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  FULL_MODAL_SHELL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import type { RecordRow } from "./RecordModal";

type Props = {
  open: boolean;
  rows: RecordRow[];
  today: string;
  initialTab?: "all" | "overdue" | "pending" | "dueSoon";
  onClose: () => void;
  onSelectRow: (row: RecordRow) => void;
};

function isOpen(r: RecordRow): boolean {
  return r.state === "open";
}

function isOverdue(r: RecordRow, today: string): boolean {
  return isOpen(r) && Boolean(r.dueDate) && r.dueDate! < today;
}

function isDueSoon(r: RecordRow, today: string): boolean {
  if (!isOpen(r) || !r.dueDate || r.dueDate < today) return false;
  const target = new Date(`${today}T00:00:00`);
  target.setDate(target.getDate() + 7);
  return r.dueDate <= target.toISOString().slice(0, 10);
}

function daysOverdue(dueDate?: string | null, today = ""): number {
  if (!dueDate || dueDate >= today) return 0;
  const d1 = new Date(`${today}T00:00:00`).getTime();
  const d2 = new Date(`${dueDate}T00:00:00`).getTime();
  return Math.max(1, Math.floor((d1 - d2) / 86400000));
}

function formatDate(val?: string | null): string {
  if (!val) return "—";
  const d = new Date(`${val}T00:00:00`);
  if (Number.isNaN(d.getTime())) return val;
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function ActionRequiredModal({
  open,
  rows,
  today,
  initialTab = "all",
  onClose,
  onSelectRow,
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "overdue" | "pending" | "dueSoon">(initialTab);

  const actionRows = useMemo(() => {
    return rows.filter((r) => isOpen(r) || isOverdue(r, today));
  }, [rows, today]);

  const overdueCount = useMemo(() => rows.filter((r) => isOverdue(r, today)).length, [rows, today]);
  const pendingCount = useMemo(() => actionRows.filter((r) => !isOverdue(r, today)).length, [actionRows, today]);
  const dueSoonCount = useMemo(() => rows.filter((r) => isDueSoon(r, today)).length, [rows, today]);

  const filteredRows = useMemo(() => {
    if (activeTab === "overdue") return rows.filter((r) => isOverdue(r, today));
    if (activeTab === "pending") return actionRows.filter((r) => !isOverdue(r, today) && isOpen(r));
    if (activeTab === "dueSoon") return rows.filter((r) => isDueSoon(r, today));
    return actionRows;
  }, [actionRows, rows, activeTab, today]);

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="action-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 id="action-modal-title" className={MODAL_TITLE_CLASS}>
              Action Required Queue
            </h3>
            <p className={MODAL_SUBTITLE_CLASS}>
              Overdue & pending items awaiting consultant or contractor response
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

      {/* Tabs */}
      <div className="flex border-b border-line bg-paper/50 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === "all"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          All Waiting ({actionRows.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className={`py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === "overdue"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-rose-500/80 hover:text-rose-600"
          }`}
        >
          Overdue ({overdueCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-700 dark:text-amber-400"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dueSoon")}
          className={`py-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === "dueSoon"
              ? "border-sky-500 text-sky-600 dark:text-sky-400"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Due in 7 Days ({dueSoonCount})
        </button>
      </div>

      <div className={MODAL_BODY_CLASS}>
        {filteredRows.length === 0 ? (
          <div className="py-12 text-center text-muted">
            <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-lg dark:bg-emerald-950 dark:text-emerald-400">
              ✓
            </span>
            <p className="font-bold text-ink">All caught up!</p>
            <p className="text-xs text-muted mt-1">No items waiting in this filter queue.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[130px_70px_1fr_24px] gap-2 px-3 py-1.5 text-[11px] font-bold uppercase text-muted border-b border-line">
              <span>Status</span>
              <span>Age / Due</span>
              <span>Reference & Subject</span>
              <span />
            </div>

            {filteredRows.map((r) => {
              const late = isOverdue(r, today);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRow(r);
                  }}
                  className="w-full text-left grid grid-cols-[130px_70px_1fr_24px] gap-2 items-center rounded-lg border border-line bg-paper/40 p-2.5 hover:bg-teal-50/70 dark:bg-navy/30 dark:hover:bg-accent/15 transition cursor-pointer"
                >
                  <div className="shrink-0">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        late
                          ? "bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {late ? "Overdue" : r.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold tabular-nums whitespace-nowrap shrink-0">
                    {late ? (
                      <span className="text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {daysOverdue(r.dueDate, today)}d late
                      </span>
                    ) : (
                      <span className="text-muted whitespace-nowrap">
                        {r.dueDate ? formatDate(r.dueDate) : "—"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent whitespace-nowrap tracking-tight">
                        {r.refNo}
                      </span>
                      <span className="rounded bg-paper px-1.5 py-0.2 text-[10px] text-muted">
                        {r.subcategory}
                      </span>
                    </div>
                    <p className="truncate text-xs font-medium text-ink mt-0.5">
                      {r.title}
                    </p>
                  </div>

                  <div className="text-right text-muted font-bold">›</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </CenteredModal>
  );
}
