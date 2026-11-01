"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from "lucide-react";
import type { GovernanceFormTemplate } from "@/lib/governance-forms";
import type { RecordRow } from "./RecordModal";

// Import all 14 official form sheets
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

type Props = {
  open: boolean;
  onClose: () => void;
  template: GovernanceFormTemplate | null;
  registerRecords?: RecordRow[];
  initialRecord?: RecordRow | null;
};

export function FormPdfViewerModal({
  open,
  onClose,
  template,
  registerRecords = [],
  initialRecord = null,
}: Props) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");

  // Editable / synced form state
  const [formData, setFormData] = useState({
    projectName: "SDSB · BANTING TECHNOLOGY PARK (BTP)",
    docNo: "",
    refNo: "BTP-QAQC-RFWI-0001",
    accRef: "ACC-QAQC-2026-0001",
    revision: "Rev 02",
    dateSubmitted: new Date().toISOString().split("T")[0],
    targetDate: new Date().toISOString().split("T")[0],
    requestedInspectionDateTime: new Date().toISOString().split("T")[0] + " / 10:00 AM",
    workPackage: "WP-01 Data Centre Main Works",
    discipline: "Civil & Structural",
    activity: "Concrete Pouring & Reinforcement Inspection",
    location: "Block A - Grid 1-5 / Level 1",
    dwgRef: "BTP-STR-DWG-1001 Rev 02",
    relatedRef: "MOS-STR-001 / MAF-CONC-002",
    requestedBy: "DAMIA",
    requestedRole: "Document Controller / Site Engineer",
    requestedCompany: "SDSB (General Contractor)",
    inspectionResult: "passed",
    inspectionComments: "Workmanship and reinforcement comply with approved shop drawings and specifications.",
    consultantName: "Ir. Dr. K. Nathan",
    consultantCompany: "Resident Engineer (C&S Consultant)",
    // Material Approval specific
    materialDesc: "Ready Mix Concrete Grade 40 (OPC)",
    supplier: "Lafarge Concrete Malaysia Sdn Bhd",
    manufacturer: "Lafarge Banting Batching Plant",
    origin: "Malaysia",
    specRef: "Spec Section 03300 - Cast-in-place Concrete",
    // NCR specific
    ncrCategory: "Workmanship",
    ncrPriority: "Medium",
    ncrDesc: "Honeycombing observed at shear wall SW-02 lower section after formwork striking.",
    ncrRequirement: "Project Specification Clause 4.2 - Concrete surface shall be free from honeycombing.",
    ncrAction: "Area cordoned off. Investigation conducted with R.E. and repair procedure submitted.",
    ncrRootCause: "Insufficient vibration compaction at high-density reinforcement corner.",
    ncrCorrective: "Revise method statement, provide formwork inspection window and re-train vibrator operators.",
    // MoM / Attendance specific
    meetingTitle: "Weekly Site QA/QC & Technical Coordination Meeting",
    meetingNo: "BTP-QAQC-MOM-014",
    meetingTime: "10:00 AM - 12:00 PM",
    chairperson: "Marcus Tan (Senior QA/QC Manager - PMC)",
  });

  // Sync initialRecord or template defaults
  useEffect(() => {
    if (!template) return;

    const baseDocNo = template.code;
    let initialRef = initialRecord?.refNo || (
      template.id === "rfwi" ? "BTP-QAQC-RFWI-0001" :
      template.id === "maf" ? "BTP-QAQC-MAF-0001" :
      template.id === "ncr" ? "BTP-QAQC-NCR-0001" :
      template.id === "chk" ? "BTP-QAQC-CHK-0001" :
      template.id === "itp" ? "BTP-ITP-C&S-001" :
      template.id === "attendance" ? "BTP-QAQC-ATT-0014" :
      template.id === "mom" ? "BTP-QAQC-MOM-0014" :
      template.id === "mos" ? "BTP-QAQC-MOS-001" :
      template.id === "dls" ? "BTP-QAQC-DLS-001" :
      template.id === "ra" ? "BTP-EHS-RA-001" :
      template.id === "pil" ? "BTP-QAQC-DASH-PIL-001" :
      template.id === "pqp-gc" ? "BTP-PQP-GC-001" :
      template.id === "pqp-pmc" ? "BTP-PQP-PMC-001" :
      "BTP-QAQC-REG-001"
    );
    let initialAcc = initialRecord?.accRef || "ACC-QAQC-2026-0001";
    let initialTitle = initialRecord?.title || "Site Inspection & Quality Verification";
    let initialLoc = initialRecord?.location || "Block A - Level 1";
    let initialDate = initialRecord?.recordDate || new Date().toISOString().split("T")[0];
    let initialDiscipline = initialRecord?.discipline || "Civil & Structural";

    setFormData((prev) => ({
      ...prev,
      docNo: baseDocNo,
      refNo: initialRef,
      accRef: initialAcc,
      activity: initialTitle,
      materialDesc: initialTitle,
      ncrDesc: initialTitle,
      location: initialLoc,
      dateSubmitted: initialDate,
      targetDate: initialRecord?.dueDate || initialDate,
      requestedInspectionDateTime: `${initialRecord?.dueDate || initialDate} / 10:00 AM`,
      discipline: initialDiscipline,
    }));

    if (initialRecord) {
      setSelectedRecordId(String(initialRecord.id));
    }
  }, [template, initialRecord]);

  function handleRecordSelect(recId: string) {
    setSelectedRecordId(recId);
    if (!recId) return;
    const rec = registerRecords.find((r) => String(r.id) === recId);
    if (rec) {
      const recDate = rec.recordDate || new Date().toISOString().split("T")[0];
      const recTarget = rec.dueDate || recDate;
      setFormData((prev) => ({
        ...prev,
        refNo: rec.refNo || prev.refNo,
        accRef: rec.accRef || prev.accRef,
        activity: rec.title || prev.activity,
        materialDesc: rec.title || prev.materialDesc,
        ncrDesc: rec.title || prev.ncrDesc,
        location: rec.location || prev.location,
        discipline: rec.discipline || prev.discipline,
        dateSubmitted: recDate,
        targetDate: recTarget,
        requestedInspectionDateTime: `${recTarget} / 10:00 AM`,
      }));
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    if (!printAreaRef.current || !template) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = printAreaRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 6;
      const marginY = 6;
      const printableW = pageWidth - marginX * 2; // 198mm
      const printableH = pageHeight - marginY * 2; // 285mm

      const canvasAspect = canvas.height / canvas.width;

      if (canvasAspect <= 1.6) {
        const scale = Math.min(printableW / canvas.width, printableH / canvas.height);
        const finalW = canvas.width * scale;
        const finalH = canvas.height * scale;
        const posX = (pageWidth - finalW) / 2;
        const posY = marginY;

        pdf.addImage(imgData, "PNG", posX, posY, finalW, finalH, undefined, "FAST");
      } else {
        const pageCanvasH = (canvas.width * printableH) / printableW;
        let sourceY = 0;
        let pageIdx = 0;

        while (sourceY < canvas.height) {
          if (pageIdx > 0) pdf.addPage();

          const sliceH = Math.min(pageCanvasH, canvas.height - sourceY);
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = sliceH;
          const ctx = tempCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sliceH,
              0,
              0,
              canvas.width,
              sliceH
            );
            const sliceData = tempCanvas.toDataURL("image/png");
            const slicePdfH = (sliceH * printableW) / canvas.width;
            pdf.addImage(sliceData, "PNG", marginX, marginY, printableW, slicePdfH, undefined, "FAST");
          }
          sourceY += pageCanvasH;
          pageIdx++;
        }
      }

      const filename = `${template.code}_${formData.refNo || "Form"}.pdf`
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_");
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  }

  if (!template) return null;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="form-pdf-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
      overlayClassName="z-[110]"
    >
      <div className={MODAL_ACCENT_CLASS} />
      
      {/* Modal Header */}
      <div className={`${MODAL_HEADER_CLASS} no-print`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-bright border border-accent/20">
              {template.code}
            </span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {template.revision} · {template.date}
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              ISO 9001 / ACC Standard Form
            </span>
          </div>
          <h3 id="form-pdf-title" className={`${MODAL_TITLE_CLASS} mt-1 text-lg`}>
            {template.title}
          </h3>
          <p className={MODAL_SUBTITLE_CLASS}>
            Official BTP Project Governance Form · Full 1:1 Content Scan from Documentation · Standard A4 PDF & Print Format.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save as PDF via Browser"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-xs hover:border-accent hover:text-accent transition cursor-pointer"
          >
            <Printer className="h-4 w-4 text-accent" />
            <span>Print PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            title="Download A4 PDF directly"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? "Generating PDF..." : "Download PDF (A4)"}</span>
          </button>

          <a
            href={`/api/templates/download?file=${encodeURIComponent(template.filename)}`}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-xs hover:border-accent hover:text-accent transition cursor-pointer"
            title="Download original template file (.xlsx / .docx)"
          >
            {template.fileFormat === "xlsx" ? (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600" />
            )}
            <span>Original Template ({template.fileFormat.toUpperCase()})</span>
          </a>

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

      {/* Toolbar: Auto-Fill & Customization (Hidden during Print) */}
      <div className="no-print border-b border-line bg-field/60 px-5 py-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-semibold text-ink">Auto-Fill from 22 Registers:</span>
            <select
              value={selectedRecordId}
              onChange={(e) => handleRecordSelect(e.target.value)}
              className="max-w-xs truncate rounded-md border border-line bg-paper px-2.5 py-1 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="">-- Select Register Record to Auto-Fill --</option>
              {registerRecords.slice(0, 150).map((r) => (
                <option key={r.id} value={String(r.id)}>
                  [{r.subcategory}] {r.refNo} - {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-muted">
            <span>Size: <strong>A4 Portrait (210 × 297 mm)</strong></span>
            <span>·</span>
            <span>Project Reference: <strong>SDSB · BANTING TECHNOLOGY PARK (BTP)</strong></span>
          </div>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className={MODAL_BODY_CLASS}>
        <div className="flex justify-center bg-slate-100 p-4 dark:bg-slate-900/50">
          <div
            ref={printAreaRef}
            id="printable-form-sheet"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-md border border-slate-300 font-sans text-xs selection:bg-teal-200"
            style={{
              boxSizing: "border-box",
              color: "#111827",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Routing to All 14 Full 1:1 Governance Form Sheets */}
            {template.id === "rfwi" && (
              <RfwiSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "maf" && (
              <MafSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "ncr" && (
              <NcrSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "chk" && (
              <ChkSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "itp" && (
              <ItpSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "attendance" && (
              <AttendanceSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "mom" && (
              <MomSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "mos" && (
              <MosSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "dls" && (
              <DlsSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "ra" && (
              <RaSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "pil" && (
              <PilSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "pqp-gc" && (
              <PqpGcSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "pqp-pmc" && (
              <PqpPmcSheet formData={formData} setFormData={setFormData} />
            )}
            {template.id === "registers-pack" && (
              <RegistersPackSheet formData={formData} setFormData={setFormData} />
            )}
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
    </CenteredModal>
  );
}
