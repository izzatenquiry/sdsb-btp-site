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
import { ScancopyViewerModal } from "./ScancopyViewerModal";
import {
  getScancopyMetaSync,
  saveScancopyDocument,
  deleteScancopyDocument,
  type ScancopyMeta,
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

  // Print Form
  function handlePrint() {
    window.print();
  }

  // Download PDF
  async function handleDownloadPdf() {
    if (!printAreaRef.current || !currentTemplate) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${form.refNo || currentTemplate.docNo || "Form"}_Preview.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. You can also use the browser Print option (Ctrl+P).");
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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-paper/60 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-bright border border-accent/25">
              {editing ? "EDIT RECORD & LIVE FORM" : "NEW RECORD & FORM"}
            </span>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              STATUS: {form.status.toUpperCase()}
            </span>
            <span className="rounded bg-teal-500/15 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-500/25 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              LIVE PREVIEW SYNC
            </span>
          </div>
          <h2 id="unified-edit-form-title" className="text-base sm:text-lg font-bold text-ink truncate tracking-tight">
            {form.refNo ? `${form.refNo} — ${currentTemplate.title}` : currentTemplate.title}
          </h2>
          <p className="text-[11px] text-muted truncate">
            {editing
              ? `Source: ${editing.sourceSheet}${editing.sourceRow ? ` · Row ${editing.sourceRow}` : ""} · Changes made on the left reflect immediately in the official A4 form.`
              : "Fill in the record fields on the left to see live updates in the official A4 form preview."}
          </p>
        </div>

        {/* Top Right Quick Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            title="Print A4 Form directly"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-accent hover:bg-field transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-accent" />
            <span className="hidden md:inline">Print</span>
          </button>

          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            title="Download high-resolution A4 PDF"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 disabled:opacity-60 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? "Exporting..." : "PDF (A4)"}</span>
          </button>

          <a
            href={`/api/templates/download?id=${currentTemplate.id}`}
            download
            title={`Download original template (${currentTemplate.fileFormat.toUpperCase()})`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink hover:border-accent transition"
          >
            {currentTemplate.fileFormat === "xlsx" ? (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span className="hidden lg:inline">{currentTemplate.fileFormat.toUpperCase()}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className={MODAL_CLOSE_CLASS}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Split Body: Left = Edit Form, Right = Live Preview */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ================= LEFT PANE: EDIT FORM ================= */}
        <div className="w-full lg:w-[460px] xl:w-[490px] shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-paper/40 flex flex-col min-h-0">
          
          <div className="shrink-0 flex items-center justify-between border-b border-line bg-field/40 px-4 py-2 text-xs font-bold text-ink uppercase tracking-wide">
            <span className="flex items-center gap-1.5 text-accent">
              <FileText className="h-3.5 w-3.5" />
              1. Form & Record Data
            </span>
            <span className="text-[10px] text-muted font-normal">Realtime Sync Active</span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-xs">
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
                        onClick={() => setScancopyViewerOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md bg-accent/10 border border-accent/30 text-accent px-2 py-1 text-[11px] font-semibold hover:bg-accent hover:text-white transition cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
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

            {/* Left Column Sticky Save Actions */}
            <div className="shrink-0 border-t border-line bg-paper/70 p-3 sm:px-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className={MODAL_BTN_CANCEL_CLASS}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-accent/25 hover:brightness-110 disabled:opacity-60 transition cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT PANE: LIVE PREVIEW FORM ================= */}
        <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-950/80 flex flex-col overflow-hidden">
          
          {/* Top Preview Toolbar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-accent" />
                Form Sheet:
              </span>
              <select
                className="rounded-md border border-line bg-field px-2 py-1 text-xs font-semibold text-ink"
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

            <div className="flex items-center gap-3 text-[11px] text-muted font-medium">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Synced Preview
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline">A4 Portrait (210 × 297 mm)</span>
            </div>
          </div>

          {/* Scrollable Preview Canvas */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 flex justify-center bg-slate-100 dark:bg-slate-950/70">
            <div
              id="printable-form-sheet"
              ref={printAreaRef}
              className="w-full max-w-[820px] bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-8 border border-slate-300 dark:border-slate-800 transition-all font-sans leading-normal self-start"
              style={{ minHeight: "1050px" }}
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
          </div>
        </div>
      </div>

      {/* Print styles injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-form-sheet,
          #printable-form-sheet * {
            visibility: visible !important;
          }
          #printable-form-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 8mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 10.5pt !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
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
