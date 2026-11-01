"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { CenteredModal } from "./CenteredModal";

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
  const [viewMode, setViewMode] = useState<"edit" | "clean">("edit");
  const [key, setKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const editUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&rm=minimal`;
  const cleanUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/htmlembed?widget=true`;
  const activeUrl = viewMode === "edit" ? editUrl : cleanUrl;
  const directLink = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  function handleRefresh() {
    setLoading(true);
    setKey((prev) => prev + 1);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  const panelClass = isFullScreen
    ? "relative z-10 flex h-[99vh] w-[99vw] max-w-[99vw] flex-col overflow-hidden rounded-xl border border-emerald-600/30 bg-paper-elevated shadow-2xl shadow-ink/40"
    : "relative z-10 flex h-[94vh] w-[96vw] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-2xl shadow-ink/30";

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      panelClassName={panelClass}
      overlayClassName="p-1 sm:p-2"
    >
      {/* Top Green Accent Bar */}
      <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />

      {/* Header Bar */}
      <div className="shrink-0 flex items-center justify-between border-b border-line bg-paper/80 px-4 py-2.5 sm:px-6">
        {/* Left: Brand & Sheet info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-ink truncate">
                {sheetTitle}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 2-Way Sync
              </span>
            </div>
            <p className="text-[11px] text-muted truncate">
              Google Sheets ID: <span className="font-mono text-ink-soft">{sheetId}</span> · BTP 22 Registers Control Centre
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* View mode toggle */}
          <div className="hidden md:flex items-center rounded-lg border border-line bg-field/70 p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => {
                setViewMode("edit");
                setLoading(true);
              }}
              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                viewMode === "edit"
                  ? "bg-paper text-accent font-semibold shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Full Interactive
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("clean");
                setLoading(true);
              }}
              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                viewMode === "clean"
                  ? "bg-paper text-accent font-semibold shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              Clean Embed
            </button>
          </div>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-paper-elevated transition cursor-pointer"
            title="Copy Google Sheet Link"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-muted" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Refresh iframe */}
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-paper-elevated transition cursor-pointer"
            title="Reload Google Sheet"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Open in new tab */}
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
            title="Open in new Google Sheets tab"
          >
            <span>New Tab</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="hidden sm:inline-flex rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink transition cursor-pointer"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink transition cursor-pointer"
            title="Close Sheet Viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main View Area: Google Sheet Iframe */}
      <div className="relative flex-1 w-full h-full min-h-0 bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper/80 backdrop-blur-xs">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-3" />
            <p className="text-sm font-bold text-ink">Connecting to Internal QAQC Live Tracking...</p>
            <p className="text-xs text-muted mt-1">Loading Google Sheets cloud interface</p>
          </div>
        )}

        <iframe
          key={key}
          src={activeUrl}
          className="w-full h-full border-0 bg-white"
          title="Internal QAQC Live Tracking - Google Sheets"
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        />
      </div>

      {/* Footer Info Strip */}
      <div className="shrink-0 flex items-center justify-between border-t border-line bg-paper/60 px-4 py-1.5 text-[11px] text-muted">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Connected: SDSB Internal QAQC Google Drive / Sheet</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Edit permissions subject to your Google Workspace account</span>
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Direct Google Drive Link</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </CenteredModal>
  );
}
