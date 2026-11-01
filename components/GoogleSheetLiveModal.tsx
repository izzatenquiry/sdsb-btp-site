"use client";

import React, { useState } from "react";
import { X, ExternalLink, RefreshCw, FileSpreadsheet } from "lucide-react";
import { CenteredModal, STANDARD_MODAL_PANEL_CLASS } from "./CenteredModal";

interface GoogleSheetLiveModalProps {
  open: boolean;
  onClose: () => void;
  sheetId?: string;
  sheetTitle?: string;
}

export function GoogleSheetLiveModal({
  open,
  onClose,
  sheetId = "11Wfxz7mFVR2Gq1vuSsix_pQSVhQXgDl3Tk1B4eaKSFs",
  sheetTitle = "Internal QAQC Live Tracking",
}: GoogleSheetLiveModalProps) {
  const [key, setKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;

  function handleRefresh() {
    setLoading(true);
    setKey((prev) => prev + 1);
  }

  if (!open) return null;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
      overlayClassName="p-2 sm:p-4"
    >
      {/* Top Green Accent Bar */}
      <div className="h-1 w-full shrink-0 bg-emerald-600" />

      {/* Standard SDSB Modal Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-line bg-paper/60 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-ink truncate">
                {sheetTitle} (Google Sheets)
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-muted truncate">
              SDSB · Banting Technology Park (BTP) · 22 Registers Control Centre
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-paper-elevated transition cursor-pointer"
            title="Reload Google Sheet"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-xs transition"
            title="Open in new Google Sheets tab"
          >
            <span>New Tab</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink transition cursor-pointer ml-1"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main View Area: Google Sheet Iframe with Native Interface */}
      <div className="relative flex-1 w-full h-full min-h-0 bg-white overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Loading Google Sheets...
            </p>
            <p className="text-xs text-slate-500">
              Retrieving live tracking registers
            </p>
          </div>
        )}

        <iframe
          key={key}
          src={sheetUrl}
          className="w-full h-full border-0 bg-white"
          title="Internal QAQC Live Tracking - Google Sheets"
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        />
      </div>
    </CenteredModal>
  );
}
