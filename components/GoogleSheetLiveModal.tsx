"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Star,
  Folder,
  Cloud,
  History,
  MessageSquare,
  Video,
  Lock,
  Search,
  Undo2,
  Redo2,
  Printer,
  Paintbrush,
  Bold,
  Italic,
  Strikethrough,
  PaintBucket,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Filter,
  Sigma,
  Link2,
  BarChart2,
  MessageSquarePlus,
  ChevronDown,
  Layers,
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
  const [key, setKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);
  const [activeCell] = useState<string>("A1");
  const [formulaValue] = useState<string>(
    "PROJECT NAME: BANTING TECHNOLOGY PARK (BTP)"
  );
  const [embedMode, setEmbedMode] = useState<"standard" | "embed">("standard");

  const directLink = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
  const embedUrl =
    embedMode === "standard"
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`
      : `https://docs.google.com/spreadsheets/d/${sheetId}/htmlembed?widget=true`;

  function handleRefresh() {
    setLoading(true);
    setKey((prev) => prev + 1);
  }

  function handlePrintSheet() {
    window.open(directLink, "_blank");
  }

  if (!open) return null;

  const panelClass = isFullScreen
    ? "relative z-10 flex h-[100vh] w-[100vw] max-w-[100vw] flex-col overflow-hidden rounded-none border-0 bg-[#f8fafd] dark:bg-[#0f172a] shadow-none"
    : "relative z-10 flex h-[95vh] w-[98vw] max-w-[98vw] flex-col overflow-hidden rounded-xl border border-line bg-[#f8fafd] dark:bg-[#0f172a] shadow-2xl shadow-ink/40";

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      panelClassName={panelClass}
      overlayClassName="p-0 sm:p-0"
    >
      {/* 1. Google Sheets Top Header Bar (Exact match to screenshot) */}
      <div className="shrink-0 bg-[#f8fafd] dark:bg-[#0f172a] border-b border-[#dadce0] dark:border-slate-800 px-3 pt-2 pb-1.5 font-sans select-none">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Google Sheets Icon + Document Title + Menus */}
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Green Google Sheets Sheet Icon */}
            <div className="pt-0.5 shrink-0">
              <svg className="h-9 w-7" viewBox="0 0 32 40" fill="none">
                <path
                  d="M20 0H4C1.8 0 0 1.8 0 4V36C0 38.2 1.8 40 4 40H28C30.2 40 32 38.2 32 36V12L20 0Z"
                  fill="#0F9D58"
                />
                <path d="M20 0L32 12H20V0Z" fill="#87CEAC" />
                <path
                  d="M7 19H25M7 25H25M7 31H25M13 14V36"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Title & Menus */}
            <div className="min-w-0">
              {/* Document Title & Status Row */}
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-medium text-[#1f1f1f] dark:text-slate-100 hover:border-b hover:border-slate-400 cursor-text truncate">
                  {sheetTitle}
                </span>
                <button
                  type="button"
                  className="text-slate-500 hover:text-amber-500 transition p-0.5"
                  title="Star"
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition p-0.5"
                  title="Move to folder"
                >
                  <Folder className="h-4 w-4" />
                </button>
                <span
                  className="text-slate-500 flex items-center gap-1 text-[11px]"
                  title="All changes saved to Drive"
                >
                  <Cloud className="h-4 w-4" />
                </span>
              </div>

              {/* Menus List (File, Edit, View, Insert, Format, Data, Tools, Extensions, Help) */}
              <div className="flex items-center gap-1 text-[13px] text-[#444746] dark:text-slate-300 mt-0.5">
                {[
                  "File",
                  "Edit",
                  "View",
                  "Insert",
                  "Format",
                  "Data",
                  "Tools",
                  "Extensions",
                  "Help",
                ].map((menu) => (
                  <button
                    key={menu}
                    type="button"
                    onClick={() => window.open(directLink, "_blank")}
                    className="px-1.5 py-0.5 rounded hover:bg-[#e8eaed] dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {menu}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: History, Comments, Meet, Share, Account, Window Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Version History */}
            <button
              type="button"
              onClick={() => window.open(directLink, "_blank")}
              className="p-1.5 rounded-full hover:bg-[#e8eaed] dark:hover:bg-slate-800 text-[#444746] dark:text-slate-300 transition"
              title="Open version history"
            >
              <History className="h-5 w-5" />
            </button>

            {/* Comment History */}
            <button
              type="button"
              onClick={() => window.open(directLink, "_blank")}
              className="p-1.5 rounded-full hover:bg-[#e8eaed] dark:hover:bg-slate-800 text-[#444746] dark:text-slate-300 transition"
              title="Open comment history"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Meet Video Call */}
            <div className="hidden sm:flex items-center rounded-full hover:bg-[#e8eaed] dark:hover:bg-slate-800 p-1 text-[#444746] dark:text-slate-300 transition cursor-pointer">
              <Video className="h-5 w-5" />
              <ChevronDown className="h-3 w-3 ml-0.5" />
            </div>

            {/* Blue Pill Share Button */}
            <button
              type="button"
              onClick={() => window.open(directLink, "_blank")}
              className="inline-flex items-center gap-2 rounded-full bg-[#c2e7ff] dark:bg-blue-600 hover:bg-[#b3dbf6] dark:hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-[#001d35] dark:text-white shadow-xs transition cursor-pointer"
              title="Share this sheet"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Share</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Upgrade Badge */}
            <button
              type="button"
              onClick={() => window.open(directLink, "_blank")}
              className="hidden lg:inline-flex rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
            >
              Upgrade
            </button>

            {/* User Profile Avatar "D" */}
            <div
              className="h-8 w-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs"
              title="Damia (SDSB QAQC Document Controller)"
            >
              D
            </div>

            {/* Fullscreen & Close Modal Controls */}
            <div className="flex items-center border-l border-slate-300 dark:border-slate-700 pl-2 ml-1 gap-1">
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#e8eaed] dark:hover:bg-slate-800 transition cursor-pointer"
                title={isFullScreen ? "Restore size" : "Maximize Fullscreen"}
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                title="Close Sheet Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Google Sheets Main Toolbar (Exact match to screenshot) */}
        <div className="mt-1 flex items-center gap-1 overflow-x-auto rounded-full bg-[#edf2fa] dark:bg-slate-900/90 px-3 py-1 text-xs text-[#444746] dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
          {/* Search Menus */}
          <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-xs text-slate-600 dark:text-slate-300 mr-1 shadow-2xs">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">Menus</span>
          </div>

          {/* Undo / Redo / Print / Paint */}
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrintSheet}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Print"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Paint format"
          >
            <Paintbrush className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] cursor-pointer">
            <span>100%</span>
            <ChevronDown className="h-3 w-3" />
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Formats: $, %, .0, 123 */}
          <button
            type="button"
            className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold"
            title="Format as currency"
          >
            $
          </button>
          <button
            type="button"
            className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold"
            title="Format as percent"
          >
            %
          </button>
          <button
            type="button"
            className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-mono text-[10px]"
            title="Decrease decimal places"
          >
            .0←
          </button>
          <button
            type="button"
            className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-mono text-[10px]"
            title="Increase decimal places"
          >
            →.0
          </button>
          <button
            type="button"
            className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px]"
            title="More formats"
          >
            123
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Font Family (Calibri) */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-medium cursor-pointer">
            <span>Calibri</span>
            <ChevronDown className="h-3 w-3" />
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Font Size (- 20 +) */}
          <div className="flex items-center gap-1 px-1">
            <button
              type="button"
              className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
            >
              -
            </button>
            <span className="w-6 text-center text-xs font-semibold bg-white dark:bg-slate-800 rounded px-1 border border-slate-300 dark:border-slate-700">
              20
            </span>
            <button
              type="button"
              className="px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
            >
              +
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Bold, Italic, Strikethrough, Text Color, Fill, Border */}
          <button
            type="button"
            className="p-1 rounded bg-[#c2e7ff] text-[#001d35] font-bold shadow-2xs"
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 italic"
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs border-b-2 border-black dark:border-white">
            A
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Fill color"
          >
            <PaintBucket className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Borders"
          >
            <Grid className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Horizontal align"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Vertical align"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Link, Comment, Chart, Filter, Functions */}
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Insert link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Insert comment"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Insert chart"
          >
            <BarChart2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded bg-[#c2e7ff] text-[#001d35] shadow-2xs"
            title="Create a filter"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-serif font-bold text-xs"
            title="Functions"
          >
            <Sigma className="h-3.5 w-3.5" />
          </button>

          {/* Spacer */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 rounded bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              <span>Reload Sheet</span>
            </button>
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white transition shadow-2xs"
            >
              <span>Open in Google Drive</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* 3. Google Sheets Formula Bar (Exact match to screenshot) */}
        <div className="mt-1 flex items-center border-t border-slate-200 dark:border-slate-800 pt-1 text-xs">
          {/* Cell Reference Box: A1 v */}
          <div className="flex items-center justify-between w-16 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center font-bold text-slate-800 dark:text-slate-100 cursor-pointer">
            <span>{activeCell}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {/* Function icon: fx */}
          <div className="px-2 text-slate-400 font-serif italic font-bold text-sm">
            fx
          </div>

          {/* Formula text input box */}
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-0.5 text-xs text-slate-800 dark:text-slate-100 font-mono overflow-x-auto whitespace-nowrap">
            {formulaValue}
          </div>
        </div>
      </div>

      {/* 4. Live Google Sheet Embedded Viewport */}
      <div className="relative flex-1 w-full h-full min-h-0 bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Loading Google Sheets Live Data...
            </p>
            <p className="text-xs text-slate-500">
              Syncing 22 tabs with Autodesk Construction Cloud (ACC)
            </p>
          </div>
        )}

        <iframe
          key={key}
          src={embedUrl}
          className="w-full flex-1 border-0 bg-white"
          title="Internal QAQC Live Tracking - Google Sheets"
          onLoad={() => setLoading(false)}
          allow="clipboard-read; clipboard-write; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
        />

        {/* Bottom Switcher: If Google blocks standard view, switch to HTML Embed */}
        <div className="shrink-0 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-[#f8fafd] dark:bg-slate-900 px-4 py-1 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected: SDSB Internal QAQC Google Drive · 22 Tabs Live Sync</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEmbedMode((prev) =>
                  prev === "standard" ? "embed" : "standard"
                );
                setLoading(true);
              }}
              className="hover:underline text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer"
            >
              {embedMode === "standard"
                ? "Switch to Clean Sheet View"
                : "Switch to Full Interface"}
            </button>
            <span>·</span>
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1"
            >
              <span>Open in Google Sheets (New Tab)</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
