"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_BODY_CLASS,
  MODAL_BTN_CANCEL_CLASS,
  MODAL_BTN_PRIMARY_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_FIELD_CLASS,
  MODAL_FOOTER_CLASS,
  MODAL_LABEL_CLASS,
  MODAL_LABEL_TEXT_CLASS,
  MODAL_SUBTITLE_CLASS,
  MODAL_TITLE_CLASS,
} from "./CenteredModal";
import { registerCatalog, type RegisterCategory } from "@/lib/register-catalog";
import { GOVERNANCE_FORMS, type GovernanceFormTemplate } from "@/lib/governance-forms";
import type { RecordRow, FormValue } from "./RecordModal";
import { calculateNextRefNo, blankForm, STATUS_OPTIONS } from "./RecordModal";
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Calendar,
  RotateCcw,
  Check,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
  Eye,
  Layers,
  Upload,
  Trash2,
  FileCheck2,
} from "lucide-react";
import {
  getScancopyMetaSync,
  getScancopyDocument,
  saveScancopyDocument,
  deleteScancopyDocument,
  type ScancopyMeta,
  type ScancopyRecord,
} from "@/lib/scancopy-storage";

// Import all official form sheet components
import { RfwiSheet } from "./forms/RfwiSheet";
import { MafSheet } from "./forms/MafSheet";
import { NcrSheet } from "./forms/NcrSheet";
import { ChkSheet } from "./forms/ChkSheet";
import { ItpSheet } from "./forms/ItpSheet";
import { AttendanceSheet } from "./forms/AttendanceSheet";
import { MomSheet } from "./forms/MomSheet";
import { MosSheet } from "./forms/MosSheet";
import { DlsSheet } from "./forms/DlsSheet";
import { RaSheet } from "./forms/RaSheet";
import { PilSheet } from "./forms/PilSheet";
import { PqpGcSheet } from "./forms/PqpGcSheet";
import { PqpPmcSheet } from "./forms/PqpPmcSheet";
import { RegistersPackSheet } from "./forms/RegistersPackSheet";

const CATEGORIES: RegisterCategory[] = [
  "Inspection",
  "Submission",
  "Test",
  "NCR & Observation",
];

type Props = {
  open: boolean;
  editing: RecordRow | null;
  onClose: () => void;
  onSaved: (msg: string, savedRecord?: RecordRow) => void;
  storageAvailable?: boolean;
  existingRecords?: RecordRow[];
  defaultSubcategory?: string;
  defaultCategory?: RegisterCategory;
};

export function UnifiedEditFormModal({
  open,
  editing,
  onClose,
  onSaved,
  storageAvailable = true,
  existingRecords = [],
  defaultSubcategory,
  defaultCategory,
}: Props) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("rfwi");

  // Scancopy closed document state
  const [scancopyMeta, setScancopyMeta] = useState<ScancopyMeta | null>(null);
  const [scancopyViewerOpen, setScancopyViewerOpen] = useState(false);
  const [scancopyUploading, setScancopyUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Mode: "form" for live A4 sheet, "scancopy" for closed signed PDF document preview inside this modal
  const [previewMode, setPreviewMode] = useState<"form" | "scancopy">("form");
  const [scancopyDoc, setScancopyDoc] = useState<ScancopyRecord | null>(null);
  const [loadingScancopyDoc, setLoadingScancopyDoc] = useState(false);

  // Mobile View: "form" for editing fields, "preview" for live A4 document view
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");

  // Form edit fields
  const [form, setForm] = useState<FormValue>(blankForm());

  // Additional form sheet specific fields synced with the preview
  const [sheetFields, setSheetFields] = useState({
    workPackage: "WP-01 Data Centre Main Works",
    revision: "Rev 02",
    dwgRef: "",
    relatedRef: "",
    requestedBy: "DAMIA",
    requestedRole: "Document Controller / Site Engineer",
    requestedCompany: "SDSB (General Contractor)",
    inspectionResult: "pending",
    inspectionComments: "",
    consultantName: "Ir. Dr. K. Nathan",
    consultantCompany: "Resident Engineer (C&S Consultant)",
    // Material Approval
    materialDesc: "",
    supplier: "",
    manufacturer: "",
    origin: "Malaysia",
    specRef: "",
    // NCR
    ncrCategory: "Workmanship",
    ncrPriority: "Medium",
    ncrRequirement: "",
    ncrAction: "",
    ncrRootCause: "",
    ncrCorrective: "",
    // MoM / Attendance
    meetingTitle: "",
    meetingNo: "",
    meetingTime: "10:00 AM - 12:00 PM",
    chairperson: "Marcus Tan (Senior QA/QC Manager - PMC)",
  });

  // Calculate next running reference number
  const runningRefInfo = useMemo(() => {
    if (editing) {
      return { lastRef: editing.refNo, nextRef: editing.refNo };
    }
    return calculateNextRefNo(form.subcategory, existingRecords);
  }, [form.subcategory, existingRecords, editing]);

  // Determine appropriate form template from subcategory & category
  const detectTemplateId = (sub: string, cat: string) => {
    if (sub.includes("RFWI")) return "rfwi";
    if (cat === "Submission" || sub.includes("MOS")) return "mos";
    if (cat === "NCR & Observation" || sub.includes("RSS") || sub.includes("SSR") || sub.includes("NCR")) return "ncr";
    if (sub.includes("ITP")) return "itp";
    if (sub.includes("CHECKLIST") || sub.includes("CHK")) return "chk";
    if (sub.includes("TEST") || sub.includes("CUBE")) return "rfwi";
    if (sub.includes("MAF")) return "maf";
    if (sub.includes("MOM")) return "mom";
    if (sub.includes("ATTENDANCE")) return "attendance";
    return "rfwi";
  };

  // Only initialize form when opening or when switching editing record ID (never on background data polls)
  const prevOpenRef = useRef(false);
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    const editingChanged = editing?.id !== editingIdRef.current;
    prevOpenRef.current = open;
    editingIdRef.current = editing?.id || null;

    if (!open) return;
    if (!justOpened && !editingChanged) return;

    setMobileView("form");

    if (editing) {
      const sub = editing.subcategory || editing.sourceSheet || defaultSubcategory || "RFWI A C&S";
      const cat = editing.category || defaultCategory || "Inspection";
      setForm({
        category: cat,
        subcategory: sub,
        refNo: editing.refNo || "",
        accRef: editing.accRef || "",
        title: editing.title || "",
        discipline: editing.discipline || "Civil & Structural",
        location: editing.location || "Block A",
        status: editing.status || STATUS_OPTIONS[cat]?.[0] || "Pending GC",
        recordDate: editing.recordDate || new Date().toISOString().slice(0, 10),
        dueDate: editing.dueDate || "",
        notes: editing.notes || "",
        staffPic: (() => {
          if (typeof window !== "undefined") {
            try {
              const u = JSON.parse(localStorage.getItem("btp_qaqc_user") || "{}");
              if (u.name) return `${u.name} (${u.role || "Document Controller / Admin"})`;
            } catch {}
          }
          return "Nur Damia (Document Controller / Admin)";
        })(),
      });
      setSheetFields({
        workPackage: "WP-01 Data Centre Main Works",
        revision: "Rev 02",
        dwgRef: "BTP-STR-DWG-1001 Rev 02",
        relatedRef: "MOS-STR-001 / MAF-CONC-002",
        requestedBy: (() => {
          if (typeof window !== "undefined") {
            try {
              const u = JSON.parse(localStorage.getItem("btp_qaqc_user") || "{}");
              if (u.name) return u.name;
            } catch {}
          }
          return "Nur Damia";
        })(),
        requestedRole: "Document Controller / Site Engineer",
        requestedCompany: "SDSB (General Contractor)",
        inspectionResult: editing.status?.toLowerCase().includes("closed") && !editing.status?.toLowerCase().includes("pending") ? "passed" : "pending",
        inspectionComments: editing.notes || "",
        consultantName: "Ir. Dr. K. Nathan",
        consultantCompany: "Resident Engineer (C&S Consultant)",
        materialDesc: editing.title || "",
        supplier: "Lafarge Concrete Malaysia Sdn Bhd",
        manufacturer: "Lafarge Banting Batching Plant",
        origin: "Malaysia",
        specRef: "Spec Section 03300 - Cast-in-place Concrete",
        ncrCategory: "Workmanship",
        ncrPriority: "Medium",
        ncrRequirement: "Project Specification Clause 4.2",
        ncrAction: "Area cordoned off. Verification submitted.",
        ncrRootCause: "Compaction gap.",
        ncrCorrective: "Revise method statement.",
        meetingTitle: editing.title || "",
        meetingNo: editing.refNo || "",
        meetingTime: "10:00 AM - 12:00 PM",
        chairperson: "Marcus Tan (Senior QA/QC Manager - PMC)",
      });
      setSelectedTemplateId(detectTemplateId(sub, cat));
    } else {
      // BRAND NEW RECORD — Reset to completely clean, blank state!
      const targetSub = defaultSubcategory || "RFWI A C&S";
      const targetCat = defaultCategory || (registerCatalog.find((r) => r.name === targetSub)?.category || "Inspection");
      const calc = calculateNextRefNo(targetSub, existingRecords);

      let nextDisc = "Civil & Structural";
      if (targetSub.includes("ARC")) nextDisc = "Architectural";
      else if (targetSub.includes("MEP") || targetSub.includes("M&E")) nextDisc = "M&E";

      let nextLoc = "Block A";
      if (targetSub.includes(" B ") || targetSub.endsWith(" B")) nextLoc = "Block B";
      else if (targetSub.includes(" C ") || targetSub.endsWith(" C")) nextLoc = "Block C";
      else if (targetSub.includes(" F ") || targetSub.endsWith(" F")) nextLoc = "Block F";

      const activeUser = (() => {
        if (typeof window !== "undefined") {
          try {
            const u = JSON.parse(localStorage.getItem("btp_qaqc_user") || "{}");
            if (u.name) return u;
          } catch {}
        }
        return { name: "Nur Damia", role: "Document Controller / Admin" };
      })();

      setForm({
        category: targetCat,
        subcategory: targetSub,
        refNo: calc.nextRef,
        accRef: "",
        title: "",
        discipline: nextDisc,
        location: nextLoc,
        status: STATUS_OPTIONS[targetCat]?.[0] || "Pending GC",
        recordDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        notes: "",
        staffPic: `${activeUser.name} (${activeUser.role || "Document Controller / Admin"})`,
      });

      setSheetFields({
        workPackage: "WP-01 Data Centre Main Works",
        revision: "Rev 01",
        dwgRef: "",
        relatedRef: "",
        requestedBy: activeUser.name,
        requestedRole: "Document Controller / Site Engineer",
        requestedCompany: "SDSB (General Contractor)",
        inspectionResult: "pending",
        inspectionComments: "",
        consultantName: "Ir. Dr. K. Nathan",
        consultantCompany: "Resident Engineer (C&S Consultant)",
        materialDesc: "",
        supplier: "",
        manufacturer: "",
        origin: "Malaysia",
        specRef: "",
        ncrCategory: "Workmanship",
        ncrPriority: "Medium",
        ncrRequirement: "",
        ncrAction: "",
        ncrRootCause: "",
        ncrCorrective: "",
        meetingTitle: "",
        meetingNo: calc.nextRef,
        meetingTime: "10:00 AM - 12:00 PM",
        chairperson: "Marcus Tan (Senior QA/QC Manager - PMC)",
      });

      setSelectedTemplateId(detectTemplateId(targetSub, targetCat));
    }
    setError("");
  }, [open, editing, defaultSubcategory, defaultCategory]);

  // Sync scancopy meta whenever form.refNo or modal opens
  useEffect(() => {
    if (form.refNo) {
      setScancopyMeta(getScancopyMetaSync(form.refNo));
    } else {
      setScancopyMeta(null);
    }
  }, [form.refNo, open]);

  // Load full scancopy doc for inline right-pane preview
  useEffect(() => {
    let cancelled = false;
    async function loadScancopy() {
      if (!form.refNo) {
        setScancopyDoc(null);
        return;
      }
      setLoadingScancopyDoc(true);
      try {
        const doc = await getScancopyDocument(form.refNo);
        if (!cancelled) setScancopyDoc(doc);
      } catch (err) {
        console.error("Failed to load scancopy document", err);
      } finally {
        if (!cancelled) setLoadingScancopyDoc(false);
      }
    }
    if (open && (previewMode === "scancopy" || scancopyMeta)) {
      void loadScancopy();
    }
    return () => {
      cancelled = true;
    };
  }, [form.refNo, previewMode, scancopyMeta, open]);

  async function handleScancopyFileSelected(file: File) {
    if (!form.refNo) {
      alert("Please provide the Internal Ref No before uploading a scancopy.");
      return;
    }
    setScancopyUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        await saveScancopyDocument({
          refNo: form.refNo,
          recordId: editing?.id || "",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/pdf",
          uploadedAt: new Date().toISOString(),
          uploadedBy: form.staffPic || "Nur Damia",
          dataUrl,
        });
        setScancopyMeta(getScancopyMetaSync(form.refNo));
        const doc = await getScancopyDocument(form.refNo);
        setScancopyDoc(doc);
        setPreviewMode("scancopy"); // Switch right pane directly to preview the new scancopy!
        setScancopyUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Scancopy upload error:", err);
      setScancopyUploading(false);
    }
  }

  async function handleRemoveScancopy() {
    if (!form.refNo) return;
    if (confirm(`Remove attached scancopy for ${form.refNo}?`)) {
      await deleteScancopyDocument(form.refNo);
      setScancopyMeta(null);
      setScancopyDoc(null);
      setPreviewMode("form");
    }
  }

  // The active template object
  const currentTemplate = useMemo(() => {
    return GOVERNANCE_FORMS.find((f) => f.id === selectedTemplateId) || GOVERNANCE_FORMS[0];
  }, [selectedTemplateId]);

  // Combined formData passed into the live preview sheets
  const liveFormData = useMemo(() => {
    const isClosed = !form.status.toLowerCase().includes("pending") && (form.status.toLowerCase().includes("closed") || form.status.toLowerCase().includes("passed"));
    return {
      projectName: "SDSB · BANTING TECHNOLOGY PARK (BTP)",
      docNo: currentTemplate.docNo || "BTP-QAQC-FRM-001",
      refNo: form.refNo || "—",
      accRef: form.accRef || "—",
      revision: sheetFields.revision || (editing ? "Rev 02" : "Rev 01"),
      dateSubmitted: form.recordDate || new Date().toISOString().slice(0, 10),
      targetDate: form.dueDate || form.recordDate || new Date().toISOString().slice(0, 10),
      requestedInspectionDateTime: `${form.dueDate || form.recordDate || new Date().toISOString().slice(0, 10)} / 10:00 AM`,
      workPackage: sheetFields.workPackage,
      discipline: form.discipline || "Civil & Structural",
      activity: form.title || (editing ? "Site Inspection & Quality Verification" : "—"),
      location: form.location || (editing ? "Block A" : "—"),
      dwgRef: sheetFields.dwgRef || "—",
      relatedRef: sheetFields.relatedRef || "—",
      requestedBy: form.staffPic.split(" ")[0] || "DAMIA",
      requestedRole: "Document Controller / Site Engineer",
      requestedCompany: "SDSB (General Contractor)",
      inspectionResult: isClosed ? "passed" : "pending",
      inspectionComments: form.notes || sheetFields.inspectionComments,
      consultantName: sheetFields.consultantName,
      consultantCompany: sheetFields.consultantCompany,
      // Specific sheet properties
      materialDesc: form.title || "—",
      supplier: sheetFields.supplier || "—",
      manufacturer: sheetFields.manufacturer || "—",
      origin: sheetFields.origin || "—",
      specRef: sheetFields.specRef || "—",
      ncrCategory: sheetFields.ncrCategory,
      ncrPriority: sheetFields.ncrPriority,
      ncrDesc: form.title || "—",
      ncrRequirement: sheetFields.ncrRequirement || "—",
      ncrAction: sheetFields.ncrAction || "—",
      ncrRootCause: sheetFields.ncrRootCause || "—",
      ncrCorrective: sheetFields.ncrCorrective || "—",
      meetingTitle: form.title || "—",
      meetingNo: form.refNo || "—",
      meetingTime: sheetFields.meetingTime,
      chairperson: sheetFields.chairperson,
    };
  }, [form, sheetFields, currentTemplate, editing]);

  function handleCategoryChange(nextCategory: RegisterCategory) {
    const matching = registerCatalog.filter((r) => r.category === nextCategory);
    const nextSub = matching[0]?.name || "";
    const calc = calculateNextRefNo(nextSub, existingRecords);

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
      status: STATUS_OPTIONS[nextCategory]?.[0] || "Pending GC",
      refNo: calc.nextRef,
      discipline: nextDisc,
      location: nextLoc,
    }));
    setSelectedTemplateId(detectTemplateId(nextSub, nextCategory));
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
    setSelectedTemplateId(detectTemplateId(nextSub, form.category));
  }

  function applyNextRunningNumber() {
    setForm((prev) => ({ ...prev, refNo: runningRefInfo.nextRef }));
  }

  function applyPresetDays(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForm((prev) => ({ ...prev, dueDate: d.toISOString().slice(0, 10) }));
  }

  // Print Form or Scancopy
  function handlePrint() {
    if (previewMode === "scancopy" && scancopyDoc?.dataUrl) {
      const win = window.open(scancopyDoc.dataUrl, "_blank");
      win?.focus();
      win?.print();
      return;
    }
    window.print();
  }

// Helper to auto-crop whitespace from captured canvas
function autoCropCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext("2d");
  if (!ctx) return sourceCanvas;
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return sourceCanvas;
  }
  const data = imgData.data;

  const isContent = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    return a > 30 && (r < 240 || g < 240 || b < 240);
  };

  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;

  topLoop: for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isContent(x, y)) {
        top = Math.max(0, y - 1);
        break topLoop;
      }
    }
  }

  bottomLoop: for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      if (isContent(x, y)) {
        bottom = Math.min(h - 1, y + 1);
        break bottomLoop;
      }
    }
  }

  leftLoop: for (let x = 0; x < w; x++) {
    for (let y = top; y <= bottom; y++) {
      if (isContent(x, y)) {
        left = Math.max(0, x - 1);
        break leftLoop;
      }
    }
  }

  rightLoop: for (let x = w - 1; x >= 0; x--) {
    for (let y = top; y <= bottom; y++) {
      if (isContent(x, y)) {
        right = Math.min(w - 1, x + 1);
        break rightLoop;
      }
    }
  }

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  if (cropW <= 20 || cropH <= 20) return sourceCanvas;

  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  const cCtx = cropped.getContext("2d");
  if (!cCtx) return sourceCanvas;
  cCtx.fillStyle = "#ffffff";
  cCtx.fillRect(0, 0, cropW, cropH);
  cCtx.drawImage(sourceCanvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
  return cropped;
}

  // Download PDF
  async function handleDownloadPdf() {
    if (previewMode === "scancopy" && scancopyDoc?.dataUrl) {
      const a = document.createElement("a");
      a.href = scancopyDoc.dataUrl;
      const safeName = (scancopyDoc.fileName || `${form.refNo || "Scancopy"}.pdf`)
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_");
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (!printAreaRef.current || !currentTemplate) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = printAreaRef.current;

      const rawCanvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
        windowHeight: 2500,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedEl) => {
          const targetEl = (clonedEl || clonedDoc.getElementById("printable-form-sheet")) as HTMLElement | null;
          if (targetEl) {
            // Force display and visibility on all ancestors
            let curr: HTMLElement | null = targetEl;
            while (curr && curr !== clonedDoc.body) {
              curr.style.display = "block";
              curr.style.visibility = "visible";
              curr.style.opacity = "1";
              curr.classList.remove("hidden");
              curr = curr.parentElement;
            }

            // Clean styling matching the live preview
            const style = clonedDoc.createElement("style");
            style.innerHTML = `
              #printable-form-sheet, #printable-form-sheet * {
                color-scheme: light !important;
                box-sizing: border-box !important;
              }
              #printable-form-sheet .no-print { display: none !important; }
              #printable-form-sheet table td, #printable-form-sheet table th {
                vertical-align: middle !important;
                line-height: 1.3 !important;
              }
              #printable-form-sheet label {
                display: inline-block !important;
                white-space: nowrap !important;
                vertical-align: middle !important;
              }
              #printable-form-sheet label * {
                vertical-align: middle !important;
              }
              .bg-slate-200 { background-color: #e2e8f0 !important; }
              .bg-slate-100 { background-color: #f1f5f9 !important; }
              .bg-slate-50  { background-color: #f8fafc !important; }
              .bg-white     { background-color: #ffffff !important; }
              .text-slate-950 { color: #020617 !important; }
              .text-slate-900 { color: #0f172a !important; }
              .text-slate-800 { color: #1e293b !important; }
              .text-slate-700 { color: #334155 !important; }
              .text-slate-600 { color: #475569 !important; }
              .text-slate-500 { color: #64748b !important; }
              .text-slate-400 { color: #94a3b8 !important; }
              .text-blue-950  { color: #172554 !important; }
              .border-slate-300 { border-color: #cbd5e1 !important; }
              .border-slate-400 { border-color: #94a3b8 !important; }
              .border-black   { border-color: #000000 !important; }
            `;
            clonedDoc.head.appendChild(style);

            // Replace native checkboxes with high-fidelity visual checkmarks that html2canvas renders identically
            clonedDoc.querySelectorAll('input[type="checkbox"]').forEach((input) => {
              const isChecked = (input as HTMLInputElement).checked;
              const box = clonedDoc.createElement("span");
              box.style.display = "inline-block";
              box.style.width = "12px";
              box.style.height = "12px";
              box.style.minWidth = "12px";
              box.style.minHeight = "12px";
              box.style.borderRadius = "2px";
              box.style.marginRight = "4px";
              box.style.verticalAlign = "middle";
              box.style.textAlign = "center";
              box.style.lineHeight = "12px";
              box.style.fontSize = "9px";
              box.style.fontWeight = "bold";
              box.style.boxSizing = "border-box";
              if (isChecked) {
                box.style.border = "1px solid #2563eb";
                box.style.backgroundColor = "#2563eb";
                box.style.color = "#ffffff";
                box.innerHTML = "&#10003;";
              } else {
                box.style.border = "1.5px solid #94a3b8";
                box.style.backgroundColor = "#ffffff";
                box.innerHTML = "&nbsp;";
              }
              input.parentNode?.replaceChild(box, input);
            });

            // Convert any computed oklch colors across elements to rgb
            try {
              const allEls = targetEl.querySelectorAll("*");
              const tempCanvas = clonedDoc.createElement("canvas");
              const tempCtx = tempCanvas.getContext("2d");
              if (tempCtx) {
                allEls.forEach((el) => {
                  const htmlEl = el as HTMLElement;
                  const cs = clonedDoc.defaultView?.getComputedStyle(htmlEl);
                  if (cs) {
                    if (cs.color && cs.color.includes("oklch")) {
                      tempCtx.fillStyle = cs.color;
                      htmlEl.style.color = tempCtx.fillStyle;
                    }
                    if (cs.backgroundColor && cs.backgroundColor.includes("oklch")) {
                      tempCtx.fillStyle = cs.backgroundColor;
                      htmlEl.style.backgroundColor = tempCtx.fillStyle;
                    }
                    if (cs.borderColor && cs.borderColor.includes("oklch")) {
                      tempCtx.fillStyle = cs.borderColor;
                      htmlEl.style.borderColor = tempCtx.fillStyle;
                    }
                  }
                });
              }
            } catch (e) {
              console.warn("Color sanitize warning:", e);
            }

            targetEl.style.boxShadow = "none";
            targetEl.style.border = "none";
          }
        },
      });

      const imgData = rawCanvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Fit preview proportionally onto 1 page A4 full page
      const pageWidth = 210;
      const pageHeight = 297;
      const aspect = rawCanvas.height / rawCanvas.width;
      
      let pdfW = pageWidth;
      let pdfH = pdfW * aspect;
      let posX = 0;
      let posY = 0;

      if (pdfH > pageHeight) {
        pdfH = pageHeight;
        pdfW = pdfH / aspect;
        posX = (pageWidth - pdfW) / 2;
        posY = 0;
      } else {
        posY = (pageHeight - pdfH) / 2;
      }

      pdf.addImage(imgData, "PNG", posX, posY, pdfW, pdfH, undefined, "FAST");

      // Safe filename without invalid characters like / or :
      const safeRef = String(form.refNo || currentTemplate.docNo || "Form")
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_")
        .trim();
      pdf.save(`${safeRef}_Official_A4.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  }

  // Save changes
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
          ? `Synced & Updated in Google Sheets: ${form.refNo}`
          : `Document Registered & Added to Google Sheets: ${form.refNo}`,
        savedRow,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save document record.");
    } finally {
      setSaving(false);
    }
  }

  const availableRegisters = registerCatalog.filter(
    (reg) => reg.category === form.category,
  );

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="unified-edit-form-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Top Main Header */}
      <div className="shrink-0 border-b border-line bg-paper/90 px-3.5 py-2.5 sm:px-6 sm:py-3 flex flex-col gap-1.5 sm:gap-2">
        {/* Row 1: Badges strictly sebaris on left, Close button on right */}
        <div className="flex items-center justify-between gap-2">
          {/* Status Badges - Strictly sebaris */}
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
            <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-bright border border-accent/25 whitespace-nowrap shrink-0">
              {editing ? "EDIT RECORD & FORM" : "NEW RECORD & FORM"}
            </span>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1 whitespace-nowrap shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              <span>STATUS: {form.status.toUpperCase()}</span>
            </span>
            <span className="rounded bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/25 hidden sm:inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <Sparkles className="h-3 w-3 shrink-0" />
              LIVE SYNC
            </span>
          </div>

          {/* Top Right: Close Button ONLY */}
          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_CLASS}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Row 2: Full-width Title & Subtitle */}
        <div className="min-w-0">
          <h2 id="unified-edit-form-title" className="text-sm sm:text-base font-bold text-ink truncate tracking-tight">
            {form.refNo ? `${form.refNo} — ${currentTemplate.title}` : currentTemplate.title}
          </h2>
          <p className="text-[11px] text-muted truncate">
            {editing
              ? `Source: ${editing.sourceSheet}${editing.sourceRow ? ` · Row ${editing.sourceRow}` : ""} · Live A4 sync active.`
              : "Isi maklumat rekod di bawah untuk auto-kemaskini borang rasmi A4."}
          </p>
        </div>
      </div>

      {/* Mobile Tab Switcher (lg:hidden) */}
      <div className="flex items-center justify-center px-3.5 py-1.5 border-b border-line bg-field/60 lg:hidden shrink-0">
        <div className="inline-flex rounded-lg border border-line bg-paper p-0.5 w-full text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileView("form")}
            className={`flex-1 py-1 rounded-md transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileView === "form" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>1. Form Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`flex-1 py-1 rounded-md transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileView === "preview" ? "bg-accent text-white shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>2. Live A4 Preview</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Split Body: Left = Edit Form, Right = Live Preview */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ================= LEFT PANE: EDIT FORM ================= */}
        <div
          className={`w-full lg:w-[460px] xl:w-[490px] shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-paper/40 flex-col min-h-0 flex-1 lg:flex-initial ${
            mobileView === "form" ? "flex" : "hidden lg:flex"
          }`}
        >
          
          <div className="shrink-0 hidden lg:flex items-center justify-between border-b border-line bg-field/40 px-4 py-2 text-xs font-bold text-ink uppercase tracking-wide">
            <span className="flex items-center gap-1.5 text-accent">
              <FileText className="h-3.5 w-3.5" />
              1. Form & Record Data
            </span>
            <span className="text-[10px] text-muted font-normal">Realtime Sync Active</span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3.5 text-xs touch-pan-y">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Staff PIC & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl border border-line bg-paper p-3">
                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>
                    Registrar / Staff PIC <span className="text-red-500">*</span>
                  </span>
                  <div className="relative mt-1">
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

                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>
                    Document Status <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={`${MODAL_FIELD_CLASS} mt-1 font-bold text-amber-700 dark:text-amber-300`}
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS[form.category]?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {!STATUS_OPTIONS[form.category]?.includes(form.status) && (
                      <option value={form.status}>{form.status}</option>
                    )}
                  </select>
                </label>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>
                    Category <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={`${MODAL_FIELD_CLASS} font-semibold`}
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value as RegisterCategory)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>
                    Register Tab (22 Registers) <span className="text-red-500">*</span>
                  </span>
                  <select
                    className={`${MODAL_FIELD_CLASS} font-semibold`}
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

              {/* Reference Numbers */}
              <div className="rounded-xl border border-line bg-field/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wide">
                    Document References
                  </span>
                  {!editing && (
                    <button
                      type="button"
                      onClick={applyNextRunningNumber}
                      className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Auto-generate
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={MODAL_LABEL_CLASS}>
                    <span className={MODAL_LABEL_TEXT_CLASS}>
                      Internal Ref No <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      className={`${MODAL_FIELD_CLASS} font-bold text-ink`}
                      value={form.refNo}
                      onChange={(e) => setForm((p) => ({ ...p, refNo: e.target.value }))}
                      placeholder="e.g. BTP-A/SDSB/EW/C&S/RFWI(RW)/001"
                      required
                    />
                  </label>

                  <label className={MODAL_LABEL_CLASS}>
                    <span className={MODAL_LABEL_TEXT_CLASS}>ACC Reference</span>
                    <input
                      type="text"
                      className={MODAL_FIELD_CLASS}
                      value={form.accRef}
                      onChange={(e) => setForm((p) => ({ ...p, accRef: e.target.value }))}
                      placeholder="ACC-QAQC-2026-0001"
                    />
                  </label>
                </div>
              </div>

              {/* Title & Activity Description */}
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>
                  Document / Form Title & Activity <span className="text-red-500">*</span>
                </span>
                <textarea
                  rows={2}
                  className={`${MODAL_FIELD_CLASS} resize-none font-medium`}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Inspection for Retaining Wall Slab (Rebar & Formwork)"
                  required
                />
              </label>

              {/* Location & Discipline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>Location / Grid Line</span>
                  <input
                    type="text"
                    className={MODAL_FIELD_CLASS}
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Block A, E18-E20 / Level 1"
                  />
                </label>

                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>Discipline / Trade</span>
                  <input
                    type="text"
                    className={MODAL_FIELD_CLASS}
                    value={form.discipline}
                    onChange={(e) => setForm((p) => ({ ...p, discipline: e.target.value }))}
                    placeholder="e.g. Civil & Structural"
                  />
                </label>
              </div>

              {/* Dates & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>Issue / Start Date</span>
                  <input
                    type="date"
                    className={MODAL_FIELD_CLASS}
                    value={form.recordDate}
                    onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))}
                  />
                </label>

                <label className={MODAL_LABEL_CLASS}>
                  <div className="flex items-center justify-between">
                    <span className={MODAL_LABEL_TEXT_CLASS}>Target Date (Due)</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applyPresetDays(3)}
                        className="text-[9px] px-1 rounded bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-white transition"
                      >
                        +3d
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetDays(7)}
                        className="text-[9px] px-1 rounded bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-white transition"
                      >
                        +7d
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetDays(14)}
                        className="text-[9px] px-1 rounded bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-white transition"
                      >
                        +14d
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    className={MODAL_FIELD_CLASS}
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </label>
              </div>

              {/* Form Specific Extra Details (Drawing / ITP Ref & Work Package) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>Drawing / ITP Ref</span>
                  <input
                    type="text"
                    className={MODAL_FIELD_CLASS}
                    value={sheetFields.dwgRef}
                    onChange={(e) => setSheetFields((p) => ({ ...p, dwgRef: e.target.value }))}
                    placeholder="BTP-STR-DWG-1001 Rev 02"
                  />
                </label>

                <label className={MODAL_LABEL_CLASS}>
                  <span className={MODAL_LABEL_TEXT_CLASS}>Work Package</span>
                  <input
                    type="text"
                    className={MODAL_FIELD_CLASS}
                    value={sheetFields.workPackage}
                    onChange={(e) => setSheetFields((p) => ({ ...p, workPackage: e.target.value }))}
                    placeholder="WP-01 Data Centre Main Works"
                  />
                </label>
              </div>

              {/* Notes & Remarks */}
              <label className={MODAL_LABEL_CLASS}>
                <span className={MODAL_LABEL_TEXT_CLASS}>Additional Notes / Remarks</span>
                <textarea
                  rows={2}
                  className={`${MODAL_FIELD_CLASS} resize-none`}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Supporting drawings, inspection remarks, follow-up actions..."
                />
              </label>

              {/* Closed Signed Document Scancopy (PDF / Consultant Sign-off) */}
              <div className="rounded-xl border border-line bg-field/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    Closed Scancopy Document (Signed PDF)
                  </span>
                  {scancopyMeta && (
                    <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 px-1.5 py-0.5 text-[9px] font-bold">
                      ATTACHED
                    </span>
                  )}
                </div>

                {scancopyMeta ? (
                  <div className="rounded-lg border border-line bg-paper p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-semibold text-ink text-xs truncate">
                        <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{scancopyMeta.fileName}</span>
                      </div>
                      <p className="text-[10px] text-muted truncate mt-0.5">
                        {(scancopyMeta.fileSize / 1024).toFixed(1)} KB · Uploaded by {scancopyMeta.uploadedBy}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("scancopy")}
                        className="inline-flex items-center gap-1 rounded-md bg-rose-600 border border-rose-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-rose-500 transition cursor-pointer shadow-xs"
                      >
                        <Eye className="h-3 w-3" />
                        Preview In Pane
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Replace file"
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-field px-2 py-1 text-[11px] font-semibold text-muted hover:text-ink transition cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveScancopy}
                        title="Remove scancopy"
                        className="rounded-md border border-red-500/30 text-red-600 dark:text-red-400 p-1 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-dashed border-rose-400/50 bg-rose-500/5 p-3 text-center cursor-pointer hover:bg-rose-500/10 hover:border-rose-500 transition group"
                  >
                    <Upload className="h-5 w-5 text-rose-500 mx-auto mb-1 group-hover:scale-110 transition" />
                    <p className="text-xs font-semibold text-ink">
                      {scancopyUploading ? "Uploading scancopy..." : "Upload Closed Scancopy PDF"}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">
                      Click to attach consultant-signed copy or inspection sign-off document
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleScancopyFileSelected(file);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>

            {/* Left Column Sticky Save Actions - Equal Ratio Full-Width Buttons */}
            <div className="shrink-0 border-t border-line bg-paper/95 backdrop-blur-xs p-2.5 sm:p-3 w-full z-10">
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${MODAL_BTN_CANCEL_CLASS} inline-flex items-center justify-center w-full text-center text-[11px] sm:text-xs font-bold`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleDownloadPdf}
                  title="Download high-resolution A4 PDF"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2 py-2 text-[11px] sm:text-xs font-bold text-accent hover:bg-accent/20 transition cursor-pointer whitespace-nowrap w-full text-center"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  <span>{downloading ? "Exporting..." : "PDF (A4)"}</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-2 py-2 text-[11px] sm:text-xs font-bold text-white shadow-sm shadow-accent/25 hover:brightness-110 disabled:opacity-60 transition cursor-pointer whitespace-nowrap w-full text-center"
                >
                  <Save className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ================= RIGHT PANE: LIVE PREVIEW FORM & SCANCOPY ================= */}
        <div
          id="unified-preview-pane"
          className={`flex-1 min-h-0 bg-slate-100 dark:bg-slate-950/80 flex-col overflow-hidden ${
            mobileView === "preview"
              ? "flex"
              : "max-lg:fixed max-lg:-left-[9999px] max-lg:top-0 max-lg:w-[820px] max-lg:pointer-events-none max-lg:opacity-0 max-lg:overflow-hidden lg:flex"
          }`}
        >
          
          {/* Top Preview Toolbar */}
          <div className="shrink-0 flex flex-col gap-2 border-b border-line bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs p-2.5 sm:px-4 sm:py-2 text-xs">
            {/* Mode Tabs & Template Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              {/* Tab Selector: Centered 50/50 ratio */}
              <div className="w-full sm:w-auto flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-line">
                <button
                  type="button"
                  onClick={() => setPreviewMode("form")}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer text-center whitespace-nowrap ${
                    previewMode === "form"
                      ? "bg-white dark:bg-slate-700 text-accent shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  <span>1. Live Form (Open)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("scancopy")}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer text-center whitespace-nowrap ${
                    previewMode === "scancopy"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  }`}
                >
                  <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
                  <span>2. Scancopy (Closed)</span>
                </button>
              </div>

              {/* Template Dropdown: FULL WIDTH */}
              {previewMode === "form" && (
                <div className="flex-1 w-full flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs hidden md:inline shrink-0">
                    Sheet:
                  </span>
                  <select
                    className="w-full rounded-md border border-line bg-field px-2.5 py-1.5 text-xs font-semibold text-ink"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    {GOVERNANCE_FORMS.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title} ({tmpl.fileFormat.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Status indicator row */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted font-medium pt-0.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {previewMode === "form" ? "Live Synced Preview" : "Signed Scancopy Mode"}
              </span>
              <span className="hidden sm:inline text-slate-400">A4 Portrait (210 × 297 mm)</span>
            </div>
          </div>


          {/* Preview Canvas: Either A4 Sheet OR Scancopy PDF */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 flex justify-center bg-slate-100 dark:bg-slate-950/70">
            {previewMode === "form" ? (
              <div
                id="printable-form-sheet"
                ref={printAreaRef}
                className="w-full max-w-[820px] bg-white text-slate-900 shadow-2xl rounded-sm p-5 sm:p-6 border border-slate-300 dark:border-slate-800 transition-all font-sans leading-normal self-start"
              >
                {selectedTemplateId === "rfwi" && (
                  <RfwiSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "maf" && (
                  <MafSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "ncr" && (
                  <NcrSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "chk" && (
                  <ChkSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "itp" && (
                  <ItpSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "attendance" && (
                  <AttendanceSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "mom" && (
                  <MomSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "mos" && (
                  <MosSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "dls" && (
                  <DlsSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "ra" && (
                  <RaSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "pil" && (
                  <PilSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "pqp-gc" && (
                  <PqpGcSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "pqp-pmc" && (
                  <PqpPmcSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
                {selectedTemplateId === "registers-pack" && (
                  <RegistersPackSheet formData={liveFormData} setFormData={setSheetFields} />
                )}
              </div>
            ) : (
              /* Scancopy Mode */
              <div className="w-full max-w-[950px] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-line overflow-hidden self-stretch" style={{ minHeight: "750px" }}>
                {loadingScancopyDoc ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-accent border-t-transparent mb-3" />
                    <p className="text-sm font-semibold text-ink">Loading signed scancopy document...</p>
                    <p className="text-xs text-muted">Retrieving PDF from local storage</p>
                  </div>
                ) : scancopyDoc?.dataUrl ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Top Scancopy Action Bar */}
                    <div className="shrink-0 bg-slate-800 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="font-bold truncate">{scancopyDoc.fileName}</span>
                        <span className="text-[10px] text-slate-300">
                          ({(scancopyDoc.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={scancopyDoc.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-700 hover:bg-slate-600 px-2.5 py-1 text-[11px] font-semibold text-white transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>New Tab</span>
                        </a>
                        <a
                          href={scancopyDoc.dataUrl}
                          download={scancopyDoc.fileName}
                          className="inline-flex items-center gap-1 rounded bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white transition shadow-xs"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download PDF</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded bg-slate-700 hover:bg-slate-600 px-2.5 py-1 text-[11px] font-semibold text-white transition cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          <span>Replace</span>
                        </button>
                      </div>
                    </div>

                    {/* PDF / Image Document Viewer */}
                    <div className="flex-1 min-h-[700px] w-full bg-slate-200 dark:bg-slate-950 p-2 flex">
                      {scancopyDoc.fileType?.includes("image") ? (
                        <div className="w-full flex justify-center items-center overflow-auto p-4">
                          <img
                            src={scancopyDoc.dataUrl}
                            alt="Signed Scancopy"
                            className="max-w-full max-h-[85vh] object-contain rounded border shadow-lg"
                          />
                        </div>
                      ) : (
                        <iframe
                          src={scancopyDoc.dataUrl}
                          className="w-full h-full min-h-[700px] rounded border border-line bg-white"
                          title={`Signed Scancopy - ${form.refNo}`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty state: Upload prompt right inside preview */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-50 dark:bg-slate-950/60">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
                      <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold text-ink mb-1">
                      No Scancopy Attached for {form.refNo || "This Record"}
                    </h3>
                    <p className="text-xs text-muted mb-6 max-w-md">
                      Upload the officially signed & stamped inspection sign-off PDF or completion certificate to preview it directly inside this pane.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-500 transition cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{scancopyUploading ? "Uploading Scancopy..." : "Upload Scancopy PDF Now"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print styles injection */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 4mm 4mm 4mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body * {
            visibility: hidden !important;
          }
          div[role="dialog"],
          div[role="dialog"] > div {
            position: static !important;
            display: block !important;
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          #unified-preview-pane {
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          #printable-form-sheet,
          #printable-form-sheet * {
            visibility: visible !important;
          }
          #printable-form-sheet {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            zoom: 0.94 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #printable-form-sheet .rfwi-sheet {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            gap: 0 !important;
            min-height: 285mm !important;
            height: 285mm !important;
            overflow: hidden !important;
            font-size: 8px !important;
            line-height: 1.1 !important;
          }
          #printable-form-sheet .rfwi-section { margin: 0 0 2mm !important; }
          #printable-form-sheet .rfwi-section-header { padding: 1mm 2mm !important; border-width: 1px !important; font-size: 8px !important; line-height: 10px !important; }
          #printable-form-sheet .rfwi-table { font-size: 7px !important; line-height: 1.08 !important; }
          #printable-form-sheet .rfwi-table td, #printable-form-sheet .rfwi-table th { padding: 1mm 1.5mm !important; }
          #printable-form-sheet .rfwi-table input[type=checkbox] { width: 8px !important; height: 8px !important; margin: 0 2px 0 0 !important; }
          #printable-form-sheet .rfwi-comments-box { min-height: 11mm !important; height: 11mm !important; padding: 1mm !important; }
          #printable-form-sheet .rfwi-signature-space { height: 6mm !important; }
          #printable-form-sheet .rfwi-sheet > div:last-child { padding-top: 0.5mm !important; padding-bottom: 0 !important; font-size: 6px !important; line-height: 8px !important; }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Scancopy Preview & Detail Modal */}
      {scancopyViewerOpen && (
        <ScancopyViewerModal
          open={scancopyViewerOpen}
          onClose={() => {
            setScancopyViewerOpen(false);
            if (form.refNo) {
              setScancopyMeta(getScancopyMetaSync(form.refNo));
            }
          }}
          refNo={form.refNo}
          recordId={editing?.id || ""}
          title={form.title}
          category={form.category}
          subcategory={form.subcategory}
          status={form.status}
          userName={form.staffPic || "Nur Damia"}
          onScancopyChanged={() => {
            if (form.refNo) {
              setScancopyMeta(getScancopyMetaSync(form.refNo));
            }
          }}
        />
      )}
    </CenteredModal>
  );
}
