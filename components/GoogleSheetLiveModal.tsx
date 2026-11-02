"use client";

import React, { useState } from "react";
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
}: GoogleSheetLiveModalProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;

  if (!open) return null;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      panelClassName={STANDARD_MODAL_PANEL_CLASS}
      overlayClassName="p-2 sm:p-4"
    >
      {/* Floating Close Button at top-right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-2.5 z-30 grid h-8 w-8 place-items-center rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white shadow-md backdrop-blur-md transition cursor-pointer text-sm font-bold border border-white/20 shrink-0"
        title="Close Google Sheet Modal"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Main View Area: Direct Google Sheet Interface */}
      <div className="relative flex-1 w-full h-full min-h-0 bg-white overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Loading Google Sheets...
            </p>
            <p className="text-xs text-slate-500">
              Internal QAQC Live Tracking
            </p>
          </div>
        )}

        <iframe
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
