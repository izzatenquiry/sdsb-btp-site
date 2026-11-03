"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MEDIUM_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_BTN_CANCEL_CLASS,
  MODAL_BTN_PRIMARY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_FIELD_CLASS,
  MODAL_FOOTER_CLASS,
  MODAL_FORM_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_LABEL_CLASS,
  MODAL_LABEL_TEXT_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import { registerCatalog, type RegisterCategory } from "@/lib/register-catalog";
import { Sparkles, Calendar, RotateCcw, Printer, Check, Clock, User, ShieldCheck } from "lucide-react";

export type RecordRow = {
  id: string;
  category: RegisterCategory;
  subcategory: string;
  sourceSheet: string;
  sourceRow?: number | null;
  refNo: string;
  accRef?: string;
  title: string;
  discipline?: string;
  location?: string;
  status: string;
  state: "open" | "closed" | "unknown";
  dueDate?: string | null;
  recordDate?: string | null;
  notes?: string;
  origin?: string;
  trade?: string;
  workItem?: string;
  accRefA?: string;
  descriptionA?: string;
  accRefB?: string;
  descriptionB?: string;
};

export type FormValue = {
  category: RegisterCategory;
  subcategory: string;
  refNo: string;
  accRef: string;
  title: string;
  discipline: string;
  location: string;
  status: string;
  recordDate: string;
  dueDate: string;
  notes: string;
  staffPic: string;
};

const CATEGORIES: RegisterCategory[] = [
  "Inspection",
  "Submission",
  "Test",
  "NCR & Observation",
];

export const STATUS_OPTIONS: Record<RegisterCategory, string[]> = {
  Inspection: [
    "Pending GC",
    "Pending Consultant",
    "In Progress",
    "Open ACC Form",
    "Passed",
    "Rejected",
    "Closed",
  ],
  Submission: [
    "Awaiting Response",
    "Submitted",
    "Under Review",
    "No Objection",
    "No Objection with Comments",
    "Resubmission Required",
    "Rejected",
    "Closed",
  ],
  Test: [
    "Scheduled",
    "Report Pending",
    "Test record",
    "Passed",
    "Failed",
    "Completed",
    "Closed",
  ],
  "NCR & Observation": [
    "Open",
    "In Review",
    "Pending Response",
    "Corrective Action Submitted",
    "Closed",
  ],
};

/**
 * Automatically calculates the next running reference number based on existing records
 */
export function calculateNextRefNo(
  subcategory: string,
  records: RecordRow[],
): { lastRef: string; nextRef: string } {
  const regDef = registerCatalog.find((r) => r.name === subcategory);
  const relevantSheets = new Set<string>();
  if (regDef?.sourceSheets) {
    regDef.sourceSheets.forEach((s) => relevantSheets.add(s));
  }
  relevantSheets.add(subcategory);

  const matching = records.filter(
    (r) =>
      r.subcategory === subcategory ||
      (r.sourceSheet && relevantSheets.has(r.sourceSheet)),
  );

  const ignored = new Set([
    "AA-00-BBB-CCC-DDD-EEE-FFF",
    "PROFILE",
    "EW",
    "MBW",
    "MBW -F",
    "—",
    "-",
    "",
  ]);

  type Candidate = {
    numVal: number;
    start: number;
    end: number;
    padLen: number;
    fullRef: string;
  };

  const candidates: Candidate[] = [];

  for (const r of matching) {
    const ref = (r.refNo || "").trim();
    if (!ref || ignored.has(ref)) continue;

    const matches = Array.from(ref.matchAll(/\d+/g));
    if (matches.length > 0) {
      const lastM = matches[matches.length - 1];
      if (lastM && lastM.index !== undefined) {
        const numVal = parseInt(lastM[0], 10);
        candidates.push({
          numVal,
          start: lastM.index,
          end: lastM.index + lastM[0].length,
          padLen: lastM[0].length,
          fullRef: ref,
        });
      }
    }
  }

  if (candidates.length === 0) {
    if (subcategory.includes("RFWI")) {
      const block =
        subcategory.includes(" A ") || subcategory.endsWith(" A")
          ? "A"
          : subcategory.includes(" B ") || subcategory.endsWith(" B")
          ? "B"
          : subcategory.includes(" C ")
          ? "C"
          : "F";
      const disc = subcategory.includes("ARC") ? "ARCH" : "C&S";
      return {
        lastRef: "No previous record",
        nextRef: `BTP-${block}/SDSB/MBW/${disc}/RFWI/001`,
      };
    } else if (subcategory.includes("GROUT")) {
      const block = subcategory.includes("A") ? "A" : "B";
      return {
        lastRef: "No previous record",
        nextRef: `Grout-Test-(BLOCK-${block})-01`,
      };
    } else if (subcategory.includes("FOK")) {
      return {
        lastRef: "No previous record",
        nextRef: "BTP-SDSB-FOK-001",
      };
    }
    const clean = subcategory.replace(/\s+/g, "-");
    return {
      lastRef: "No previous record",
      nextRef: `BTP-QAQC-${clean}-001`,
    };
  }

  candidates.sort((a, b) => a.numVal - b.numVal);
  const maxCand = candidates[candidates.length - 1];
  const nextNum = maxCand.numVal + 1;
  const paddedStr = String(nextNum).padStart(maxCand.padLen, "0");
  const nextRef =
    maxCand.fullRef.slice(0, maxCand.start) +
    paddedStr +
    maxCand.fullRef.slice(maxCand.end);

  return {
    lastRef: maxCand.fullRef,
    nextRef,
  };
}

export function blankForm(): FormValue {
  return {
    category: "Inspection",
    subcategory: "RFWI A C&S",
    refNo: "",
    accRef: "",
    title: "",
    discipline: "Civil & Structural",
    location: "Block A",
    status: "Pending GC",
    recordDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    notes: "",
    staffPic: "DAMIA (Document Controller / Admin)",
  };
}

type Props = {
  open: boolean;
  editing: RecordRow | null;
  onClose: () => void;
  onSaved: (msg: string, savedRecord?: RecordRow, openPdf?: boolean) => void;
  storageAvailable?: boolean;
  existingRecords?: RecordRow[];
};

export function RecordModal({
  open,
  editing,
  onClose,
  onSaved,
  storageAvailable = true,
  existingRecords = [],
}: Props) {
  const [form, setForm] = useState<FormValue>(blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitIntent, setSubmitIntent] = useState<"save" | "saveAndPdf">("save");

  // Calculate next running reference number
  const runningRefInfo = useMemo(() => {
    if (editing) {
      return { lastRef: editing.refNo, nextRef: editing.refNo };
    }
    return calculateNextRefNo(form.subcategory, existingRecords);
  }, [form.subcategory, existingRecords, editing]);

  // Default auto-fill running reference number on new open document
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        category: editing.category,
        subcategory: editing.subcategory || editing.sourceSheet || "RFWI A C&S",
        refNo: editing.refNo || "",
        accRef: editing.accRef || "",
        title: editing.title || "",
        discipline: editing.discipline || "",
        location: editing.location || "",
        status: editing.status || STATUS_OPTIONS[editing.category][0],
        recordDate: editing.recordDate || "",
        dueDate: editing.dueDate || "",
        notes: editing.notes || "",
        staffPic: "DAMIA (Document Controller / Admin)",
      });
    } else {
      const initial = blankForm();
      const calc = calculateNextRefNo(initial.subcategory, existingRecords);
      initial.refNo = calc.nextRef;
      setForm(initial);
    }
    setError("");
  }, [open, editing, existingRecords]);

  const availableRegisters = registerCatalog.filter(
    (reg) => reg.category === form.category,
  );

  function handleCategoryChange(nextCategory: RegisterCategory) {
    const matching = registerCatalog.filter((r) => r.category === nextCategory);
    const nextSub = matching[0]?.name || "";
    const calc = calculateNextRefNo(nextSub, existingRecords);

    // Preset discipline and block based on subcategory
    let nextDisc = "Civil & Structural";
    let nextLoc = "Block A";
    if (nextSub.includes("ARC")) nextDisc = "Architectural";
    if (nextSub.includes("MEP") || nextSub.includes("M&E")) nextDisc = "M&E";
    if (nextSub.includes(" B ") || nextSub.endsWith(" B")) nextLoc = "Block B";
    if (nextSub.includes(" C ") || nextSub.endsWith(" C")) nextLoc = "Block C";
    if (nextSub.includes(" F ") || nextSub.endsWith(" F")) nextLoc = "Block F";

    setForm((prev) => ({
      ...prev,
      category: nextCategory,
      subcategory: nextSub,
      status: STATUS_OPTIONS[nextCategory][0],
      refNo: calc.nextRef,
      discipline: nextDisc,
      location: nextLoc,
    }));
  }

  function handleSubcategoryChange(nextSub: string) {
    const calc = calculateNextRefNo(nextSub, existingRecords);
    let nextDisc = form.discipline;
    let nextLoc = form.location;
    if (nextSub.includes("ARC")) nextDisc = "Architectural";
    else if (nextSub.includes("C&S")) nextDisc = "Civil & Structural";

    if (nextSub.includes(" A ") || nextSub.endsWith(" A")) nextLoc = "Block A";
    else if (nextSub.includes(" B ") || nextSub.endsWith(" B")) nextLoc = "Block B";
    else if (nextSub.includes(" C ") || nextSub.endsWith(" C")) nextLoc = "Block C";
    else if (nextSub.includes(" F ") || nextSub.endsWith(" F")) nextLoc = "Block F";

    setForm((prev) => ({
      ...prev,
      subcategory: nextSub,
      refNo: calc.nextRef,
      discipline: nextDisc,
      location: nextLoc,
    }));
  }

  function applyNextRunningNumber() {
    setForm((prev) => ({ ...prev, refNo: runningRefInfo.nextRef }));
  }

  function applyPresetDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForm((prev) => ({ ...prev, dueDate: d.toISOString().slice(0, 10) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.refNo.trim() || !form.title.trim()) {
      setError("Reference Number and Document Title are required.");
      return;
    }

    if (!storageAvailable) {
      setError("SQLite storage is unavailable. Unable to save record.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        recordDate: form.recordDate || null,
        sourceSheet: editing?.sourceSheet || form.subcategory || "Dashboard entry",
      };

      const url = editing
        ? `/api/records/${encodeURIComponent(editing.id)}`
        : "/api/records";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; record?: RecordRow };
      if (!res.ok) {
        throw new Error(data.error || "Failed to save document record.");
      }

      const savedRow: RecordRow = data.record || {
        id: editing?.id || `rec-${Date.now()}`,
        category: form.category,
        subcategory: form.subcategory,
        sourceSheet: form.subcategory,
        refNo: form.refNo,
        accRef: form.accRef,
        title: form.title,
        discipline: form.discipline,
        location: form.location,
        status: form.status,
        state: !form.status.toLowerCase().includes("pending") && (form.status.toLowerCase().includes("closed") || form.status.toLowerCase().includes("passed")) ? "closed" : "open",
        dueDate: form.dueDate || null,
        recordDate: form.recordDate || null,
        notes: form.notes,
      };

      onSaved(
        editing
          ? `Updated successfully: ${form.refNo}`
          : `Open Document Registered: ${form.refNo}`,
        savedRow,
        submitIntent === "saveAndPdf",
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save document record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="record-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />
      <div className={MODAL_HEADER_CLASS}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-bright border border-accent/20">
              {editing ? "UPDATE RECORD" : "REGISTER OPEN DOCUMENT"}
            </span>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              STATUS: OPEN
            </span>
          </div>
          <h2 id="record-modal-title" className={MODAL_TITLE_CLASS}>
            {editing ? `Update Record: ${editing.refNo}` : "Open Document / Form Registration"}
          </h2>
          <p className={MODAL_SUBTITLE_CLASS}>
            {editing
              ? `Register Source: ${editing.sourceSheet}${editing.sourceRow ? ` · Row ${editing.sourceRow}` : ""}`
              : "Fast registration form for staff to log new open documents with automatic running reference numbers."}
          </p>
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

      <form onSubmit={handleSubmit} className={MODAL_FORM_CLASS}>
        <div className={MODAL_BODY_CLASS}>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Top Row: Staff PIC & Status Banner */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-line bg-paper/50 p-3">
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>
                  Registrar / Staff PIC <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-accent" />
                  <input
                    type="text"
                    className={`${MODAL_FIELD_CLASS} pl-8 font-semibold text-ink`}
                    value={form.staffPic}
                    onChange={(e) => setForm((p) => ({ ...p, staffPic: e.target.value }))}
                    placeholder="Staff Name / DC"
                  />
                </div>
              </label>

              {/* Status */}
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>
                  Open Document Status <span className="text-red-500">*</span>
                </span>
                <select
                  className={`${MODAL_FIELD_CLASS} font-bold text-amber-700 dark:text-amber-300`}
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  {STATUS_OPTIONS[form.category].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Register Selection Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Category */}
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>
                  Document Category <span className="text-red-500">*</span>
                </span>
                <select
                  className={MODAL_FIELD_CLASS}
                  value={form.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as RegisterCategory)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              {/* Subcategory / 22 Registers */}
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>
                  Register Tab / Type (22 Registers) <span className="text-red-500">*</span>
                </span>
                <select
                  className={MODAL_FIELD_CLASS}
                  value={form.subcategory}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                >
                  {availableRegisters.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Reference Number Strip with Auto-Continue helper */}
            <div className="rounded-xl border border-accent/30 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Document Reference (Internal Reference & ACC Reference) <span className="text-red-500">*</span>
                </span>
                {!editing && (
                  <button
                    type="button"
                    onClick={applyNextRunningNumber}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Use Suggested Running No.</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    className={`${MODAL_FIELD_CLASS} font-mono font-bold text-accent text-sm`}
                    placeholder="Internal Reference (e.g. BTP-A/SDSB/MBW/C&S/RFWI/288)"
                    value={form.refNo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, refNo: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className={MODAL_FIELD_CLASS}
                    placeholder="ACC Reference (e.g. BTP-A_Sbmtl_005)"
                    value={form.accRef}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, accRef: e.target.value }))
                    }
                  />
                </div>
              </div>

              {!editing && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted pt-1 border-t border-accent/15">
                  <span>
                    Last Record: <strong className="text-ink font-mono">{runningRefInfo.lastRef}</strong>
                  </span>
                  <span>
                    Next Running No.: <strong className="text-accent font-mono">{runningRefInfo.nextRef}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Title / Description */}
            <label className={MODAL_LABEL_CLASS}>
              <span className={MODAL_LABEL_TEXT_CLASS}>
                Document & Form Title / Description <span className="text-red-500">*</span>
              </span>
              <textarea
                className={`${MODAL_FIELD_CLASS} min-h-[65px] resize-y`}
                rows={2}
                placeholder="e.g. Level 1 floor slab inspection, concrete material approval submission, or cube test report..."
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
              />
            </label>

            {/* Location & Discipline */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>Location / Zone / Grid Line</span>
                <input
                  type="text"
                  className={MODAL_FIELD_CLASS}
                  placeholder="e.g. Block A Level 2 Grid 1-5"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </label>

              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>Discipline / Trade</span>
                <input
                  type="text"
                  className={MODAL_FIELD_CLASS}
                  placeholder="e.g. Civil & Structural / Architectural / M&E"
                  value={form.discipline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discipline: e.target.value }))
                  }
                />
              </label>
            </div>

            {/* Dates: Recorded & Due Date with Presets */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-line bg-paper/30 p-3">
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>Issue / Start Date</span>
                <input
                  type="date"
                  className={MODAL_FIELD_CLASS}
                  value={form.recordDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recordDate: e.target.value }))
                  }
                />
              </label>

              <label className={MODAL_LABEL_CLASS}>
                <div className="flex items-center justify-between mb-1">
                  <span className={MODAL_LABEL_TEXT_CLASS}>Target Completion Date (Due Date)</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => applyPresetDays(3)}
                      className="text-[10px] font-bold text-accent hover:underline px-1"
                    >
                      +3d
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDays(7)}
                      className="text-[10px] font-bold text-accent hover:underline px-1"
                    >
                      +7d
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetDays(14)}
                      className="text-[10px] font-bold text-accent hover:underline px-1"
                    >
                      +14d
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  className={MODAL_FIELD_CLASS}
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </label>
            </div>

            {/* Notes */}
            <label className={MODAL_LABEL_CLASS}>
              <span className={MODAL_LABEL_TEXT_CLASS}>Additional Notes / Attachments</span>
              <textarea
                className={`${MODAL_FIELD_CLASS} min-h-[45px] resize-y`}
                rows={1}
                placeholder="Drawing reference, supporting files or required follow-up actions..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </label>
          </div>
        </div>

        {/* Modal Footer with Equal Ratio Full-Width Buttons */}
        <div className="shrink-0 border-t border-line bg-paper/95 p-3 sm:px-6 sm:py-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={onClose}
              className={`${MODAL_BTN_CANCEL_CLASS} w-full inline-flex items-center justify-center text-center`}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={() => setSubmitIntent("save")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-xs font-bold text-ink shadow-xs hover:border-accent hover:text-accent transition cursor-pointer disabled:opacity-50 w-full text-center"
              disabled={saving}
            >
              <Check className="h-4 w-4 shrink-0" />
              <span className="truncate">{saving && submitIntent === "save" ? "Saving..." : editing ? "Save Changes" : "Register Only"}</span>
            </button>

            <button
              type="submit"
              onClick={() => setSubmitIntent("saveAndPdf")}
              className={`${MODAL_BTN_PRIMARY_CLASS} inline-flex items-center justify-center gap-1.5 shadow-md w-full text-center`}
              disabled={saving}
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {saving && submitIntent === "saveAndPdf"
                  ? "Generating..."
                  : editing
                  ? "Save & Open PDF"
                  : "Register & PDF (A4)"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </CenteredModal>
  );
}
