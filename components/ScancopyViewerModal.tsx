"use client";

import { useEffect, useRef, useState } from "react";
import {
  CenteredModal,
  STANDARD_MODAL_PANEL_CLASS,
  MODAL_ACCENT_CLASS,
  MODAL_CLOSE_CLASS,
  MODAL_HEADER_CLASS,
  MODAL_TITLE_CLASS,
  MODAL_SUBTITLE_CLASS,
} from "./CenteredModal";
import {
  FileText,
  Upload,
  Download,
  Printer,
  Trash2,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  X,
  FileCode,
} from "lucide-react";
import {
  getScancopyDocument,
  saveScancopyDocument,
  deleteScancopyDocument,
  type ScancopyRecord,
  type ScancopyMeta,
} from "@/lib/scancopy-storage";

type Props = {
  open: boolean;
  onClose: () => void;
  refNo: string;
  recordId?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  status?: string;
  userName?: string;
  onScancopyChanged?: () => void;
};

export function ScancopyViewerModal({
  open,
  onClose,
  refNo,
  recordId = "",
  title = "",
  category = "Inspection",
  subcategory = "",
  status = "Closed",
  userName = "Nur Damia",
  onScancopyChanged,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scancopy, setScancopy] = useState<ScancopyRecord | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !refNo) return;
    setLoading(true);
    getScancopyDocument(refNo)
      .then((doc) => {
        setScancopy(doc);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, refNo]);

  async function handleFileUpload(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const saved = await saveScancopyDocument(
        refNo,
        recordId || `rec-${Date.now()}`,
        file,
        file.name,
        userName
      );
      setScancopy(saved);
      if (onScancopyChanged) onScancopyChanged();
    } catch (err) {
      console.error("Failed to upload scancopy document:", err);
      alert("Failed to upload document. Please ensure file is valid.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to remove the scancopy for ${refNo}?`)) {
      return;
    }
    setLoading(true);
    await deleteScancopyDocument(refNo);
    setScancopy(null);
    setLoading(false);
    if (onScancopyChanged) onScancopyChanged();
  }

  function handleDownload() {
    if (!scancopy?.dataUrl) return;
    const a = document.createElement("a");
    a.href = scancopy.dataUrl;
    a.download = scancopy.fileName || `${refNo}_Signed_Scancopy.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handlePrint() {
    if (!scancopy?.dataUrl) return;
    const w = window.open(scancopy.dataUrl, "_blank");
    if (w) {
      w.focus();
      setTimeout(() => w.print(), 500);
    }
  }

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      labelledBy="scancopy-modal-title"
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
    >
      <div className={MODAL_ACCENT_CLASS} />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleFileUpload(files[0]);
          }
        }}
      />

      {/* Header */}
      <div className={MODAL_HEADER_CLASS}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 font-bold shrink-0 shadow-xs">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 id="scancopy-modal-title" className="text-sm font-extrabold text-ink truncate">
                Scancopy Document: <span className="font-mono text-accent">{refNo}</span>
              </h3>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                {status || "Closed"}
              </span>
            </div>
            <p className={MODAL_SUBTITLE_CLASS}>
              {scancopy
                ? `Attached: ${scancopy.fileName} (${(scancopy.fileSize / 1024).toFixed(1)} KB) · Uploaded by ${scancopy.uploadedBy} on ${scancopy.uploadedAt}`
                : `Official closed sign-off scancopy PDF · ${subcategory || category}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {scancopy ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-field px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent cursor-pointer transition"
                title="Replace scancopy file"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Replace</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-field px-2.5 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent cursor-pointer transition"
                title="Print document"
              >
                <Printer className="h-3 w-3" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-xs transition"
                title="Download PDF"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition"
                title="Remove attachment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer shadow-xs transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Scancopy PDF</span>
            </button>
          )}

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

      {/* Modal Body */}
      <div className="flex-1 min-h-0 overflow-hidden bg-slate-900/5 p-3 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted animate-pulse">
            Loading scancopy document...
          </div>
        ) : scancopy ? (
          /* ================= DOCUMENT VIEWER (PDF / IMAGE) ================= */
          <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-line bg-paper overflow-hidden shadow-xs">
            {scancopy.fileType.includes("image") ? (
              <div className="flex-1 min-h-0 overflow-auto p-4 flex items-center justify-center bg-slate-950/20">
                <img
                  src={scancopy.dataUrl}
                  alt={scancopy.fileName}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : (
              <iframe
                src={scancopy.dataUrl}
                className="w-full flex-1 min-h-0 border-0 bg-white"
                title={`Scancopy Document - ${refNo}`}
              />
            )}
          </div>
        ) : (
          /* ================= EMPTY UPLOAD STATE ================= */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-2xl border-2 border-dashed transition ${
              isDragOver
                ? "border-accent bg-accent/10"
                : "border-line bg-paper/60 hover:bg-paper/90"
            }`}
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 mb-3 shadow-xs">
              <FileText className="h-8 w-8" />
            </div>

            <h4 className="text-sm font-extrabold text-ink mb-1">
              No Scancopy Attached for {refNo}
            </h4>
            <p className="text-xs text-muted max-w-md mb-4 leading-relaxed">
              Attach the verified closed sign-off document with consultant stamps & signatures. Supports PDF, scanned images (PNG, JPG).
            </p>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-500 hover:scale-[1.02] active:scale-[0.99] cursor-pointer transition disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Uploading Scancopy..." : "Browse Scancopy PDF from Computer"}</span>
            </button>
            <span className="text-[10px] text-muted mt-2">or drag and drop file here</span>
          </div>
        )}
      </div>
    </CenteredModal>
  );
}
