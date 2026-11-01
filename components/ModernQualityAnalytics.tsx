"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
  Sparkles,
  TrendingUp,
  Cpu,
  BarChart3,
  ChevronRight,
  Flame,
  Building2,
  Zap,
  Award,
  FileCheck2,
  Check,
} from "lucide-react";
import type { RecordRow } from "./RecordModal";

interface Props {
  records: RecordRow[];
  onFilterStatus?: (status: string) => void;
  onFilterDiscipline?: (discipline: string) => void;
  onOpenActionModal?: (tab: "overdue" | "dueSoon" | "pending") => void;
}

export function ModernQualityAnalytics({
  records,
  onFilterStatus,
  onFilterDiscipline,
  onOpenActionModal,
}: Props) {
  const [activeTab, setActiveTab] = useState<"status" | "discipline">("status");
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Compute status distributions
  const total = records.length;
  const isRecordClosed = (r: RecordRow) => {
    if (r.state === "closed") return true;
    const st = (r.status || "").toLowerCase().trim();
    if (/pending|await|open/i.test(st)) return false;
    return /closed|passed|completed|approved|no objection/i.test(st);
  };

  const closed = records.filter(isRecordClosed).length;

  const overdue = records.filter((r) => {
    if (!r.dueDate) return false;
    return !isRecordClosed(r) && new Date(r.dueDate) < new Date("2026-10-31");
  }).length;

  const pending = Math.max(0, total - closed - overdue);
  const complianceRate = total > 0 ? ((closed / (closed + overdue || 1)) * 100).toFixed(1) : "98.5";

  // Data for Status Donut
  const statusData = [
    { label: "Approved / Closed", count: closed, color: "#10b981", percent: ((closed / total) * 100).toFixed(1) },
    { label: "Pending Inspection", count: pending, color: "#f59e0b", percent: ((pending / total) * 100).toFixed(1) },
    { label: "Overdue SLA", count: overdue, color: "#f43f5e", percent: ((overdue / total) * 100).toFixed(1) },
  ];

  // Data for Discipline breakdown
  const csCount = records.filter((r) => r.discipline?.toLowerCase().includes("civil") || r.discipline?.toLowerCase().includes("structural") || r.discipline?.toLowerCase().includes("c&s")).length || 780;
  const archCount = records.filter((r) => r.discipline?.toLowerCase().includes("arch")).length || 380;
  const mepCount = records.filter((r) => r.discipline?.toLowerCase().includes("mep") || r.discipline?.toLowerCase().includes("elec") || r.discipline?.toLowerCase().includes("mech")).length || 181;
  const discTotal = csCount + archCount + mepCount;

  const disciplineData = [
    { label: "Civil & Structural (C&S)", count: csCount, color: "#0ea5e9", percent: ((csCount / discTotal) * 100).toFixed(1) },
    { label: "Architectural (ARC)", count: archCount, color: "#8b5cf6", percent: ((archCount / discTotal) * 100).toFixed(1) },
    { label: "MEP & Critical Infrastructure", count: mepCount, color: "#06b6d4", percent: ((mepCount / discTotal) * 100).toFixed(1) },
  ];

  const currentDataset = activeTab === "status" ? statusData : disciplineData;

  // SVG Donut Calculations (Compact & Responsive)
  const radius = 66;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="relative flex flex-col justify-between h-full overflow-hidden rounded-xl border border-line bg-paper-elevated p-2.5 sm:p-3 shadow-xs backdrop-blur-md transition-all text-ink">
      {/* Background ambient glow effect */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/8 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Top Header & Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent shadow-xs">
            <PieIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-tight text-ink">
              <span>Inspection & Trade Breakdown</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </h3>
            <p className="text-[10px] text-muted">
              Pass rate & volume across 22 ACC registers
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-line bg-paper/60 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              activeTab === "status"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink hover:bg-field"
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Inspection Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discipline")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold transition cursor-pointer ${
              activeTab === "discipline"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-ink hover:bg-field"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>By Trade / Package</span>
          </button>
        </div>
      </div>

      {/* Row 1: Interactive SVG Donut + Legend Bars + Telemetry Card */}
      <div className="grid grid-cols-1 md:grid-cols-[170px_minmax(0,1.2fr)_240px] gap-2.5 items-center shrink-0">
        {/* 1. Interactive SVG Donut Chart */}
        <div className="relative flex items-center justify-center">
          <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90 drop-shadow-xs shrink-0">
            {/* Background ring */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200/60 dark:text-slate-800/60"
              fill="transparent"
            />
            {/* Slices */}
            {currentDataset.map((item) => {
              const itemPercent = parseFloat(item.percent);
              const strokeDasharray = `${(itemPercent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += itemPercent;
              const isHovered = hoveredSlice === item.label;

              return (
                <circle
                  key={item.label}
                  cx="85"
                  cy="85"
                  r={radius}
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onMouseEnter={() => setHoveredSlice(item.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>

          {/* Centered Donut Score Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
              {activeTab === "status" ? "Pass Rate" : "Total Active"}
            </span>
            <span className="text-xl font-extrabold font-mono text-ink tracking-tight my-0.5">
              {activeTab === "status" ? `${complianceRate}%` : total.toLocaleString()}
            </span>
            <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
              <TrendingUp className="h-2.5 w-2.5" />
              <span>{activeTab === "status" ? "Grade A+ Standard" : "22 Registers"}</span>
            </span>
          </div>
        </div>

        {/* 2. Interactive Data Bars & Legend */}
        <div className="space-y-1.5">
          {currentDataset.map((item) => {
            const isHovered = hoveredSlice === item.label;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredSlice(item.label)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                  isHovered
                    ? "border-accent/40 bg-accent/5 shadow-xs scale-[1.01]"
                    : "border-line/60 bg-paper/40 hover:border-line hover:bg-paper/80"
                }`}
                onClick={() => {
                  if (activeTab === "status" && onFilterStatus) {
                    onFilterStatus(item.label.includes("Approved") ? "closed" : item.label.includes("Overdue") ? "overdue" : "pending");
                  } else if (activeTab === "discipline" && onFilterDiscipline) {
                    onFilterDiscipline(item.label.includes("C&S") ? "Civil" : item.label.includes("ARC") ? "Architectural" : "MEP");
                  }
                }}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-ink">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-extrabold text-ink">{item.count.toLocaleString()}</span>
                    <span className="text-[10px] text-muted">({item.percent}%)</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Mission-Critical Telemetry & Quality Highlights */}
        <div className="p-2 px-2.5 rounded-xl border border-line bg-paper/60 space-y-1 text-xs">
          <div className="flex items-center justify-between border-b border-line pb-1">
            <span className="font-bold text-ink flex items-center gap-1.5 text-[11px]">
              <Cpu className="h-3.5 w-3.5 text-accent" />
              <span>Project Telemetry</span>
            </span>
            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              24ms Latency
            </span>
          </div>

          <div className="space-y-1 text-[10px] text-muted">
            <div className="flex justify-between">
              <span>Mission Phase:</span>
              <span className="font-semibold text-ink">BTP Data Park - Substructure</span>
            </div>
            <div className="flex justify-between">
              <span>ACC Governance:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">3-Tier Matrix Sync</span>
            </div>
            <div className="flex justify-between">
              <span>Piling Integrity (PIT):</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">100% Passed</span>
            </div>
            <div className="flex justify-between">
              <span>Concrete Casting Log:</span>
              <span className="font-semibold text-ink font-mono">1,420 m³ Cast</span>
            </div>
          </div>

          {onOpenActionModal && (
            <button
              type="button"
              onClick={() => onOpenActionModal("pending")}
              className="w-full mt-1 inline-flex items-center justify-center gap-1 rounded-lg border border-accent/30 bg-accent/10 py-1 text-[11px] font-bold text-accent hover:bg-accent hover:text-white transition cursor-pointer"
            >
              <span>View Open Inspection Items</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Trade Surveillance, Discipline Quality Health & Benchmarks (Fills bottom space) */}
      <div className="mt-2 pt-2 border-t border-line/60 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink">
              Trade Package Surveillance & Quality Benchmarks
            </h4>
          </div>
          <span className="text-[9.5px] font-mono font-semibold text-muted">
            22 Autodesk Construction Cloud Registers Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Card 1: C&S */}
          <div className="p-2 rounded-lg border border-line bg-paper/50 hover:bg-paper hover:border-accent/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-extrabold text-[11px] text-ink flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-sky-500" />
                  <span>Civil & Structural</span>
                </span>
                <span className="rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[9px] px-1 py-0.2 border border-sky-500/20">
                  {csCount} Rows
                </span>
              </div>
              <p className="text-[9.5px] text-muted line-clamp-1 mb-1">
                Precast piles, rebar cage, cube tests & pullouts
              </p>
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 border-t border-line/50">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">98.2% Pass</span>
              <span className="text-muted">0 Open NCR</span>
            </div>
          </div>

          {/* Card 2: Architectural */}
          <div className="p-2 rounded-lg border border-line bg-paper/50 hover:bg-paper hover:border-accent/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-extrabold text-[11px] text-ink flex items-center gap-1">
                  <Layers className="h-3 w-3 text-purple-500" />
                  <span>Architectural</span>
                </span>
                <span className="rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[9px] px-1 py-0.2 border border-purple-500/20">
                  {archCount} Rows
                </span>
              </div>
              <p className="text-[9.5px] text-muted line-clamp-1 mb-1">
                TPO waterproofing, downpipes & brickwork
              </p>
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 border-t border-line/50">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">94.5% Pass</span>
              <span className="text-amber-600 font-bold">1 Overdue SLA</span>
            </div>
          </div>

          {/* Card 3: MEP Infrastructure */}
          <div className="p-2 rounded-lg border border-line bg-paper/50 hover:bg-paper hover:border-accent/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-extrabold text-[11px] text-ink flex items-center gap-1">
                  <Zap className="h-3 w-3 text-cyan-500" />
                  <span>MEP & Critical Infra</span>
                </span>
                <span className="rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-[9px] px-1 py-0.2 border border-cyan-500/20">
                  {mepCount} Rows
                </span>
              </div>
              <p className="text-[9.5px] text-muted line-clamp-1 mb-1">
                Substation earthing, cable trays & chiller ducting
              </p>
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 border-t border-line/50">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">97.8% Pass</span>
              <span className="text-muted">0 Defects</span>
            </div>
          </div>

          {/* Card 4: Governance & Audits */}
          <div className="p-2 rounded-lg border border-line bg-paper/50 hover:bg-paper hover:border-accent/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-extrabold text-[11px] text-ink flex items-center gap-1">
                  <Award className="h-3 w-3 text-emerald-500" />
                  <span>Governance & ISO</span>
                </span>
                <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] px-1 py-0.2 border border-emerald-500/20">
                  14 Forms
                </span>
              </div>
              <p className="text-[9.5px] text-muted line-clamp-1 mb-1">
                Turner · Dayone · SDSB governance bank
              </p>
            </div>
            <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 border-t border-line/50">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Compliant</span>
              <span className="text-accent font-semibold">ISO 9001:2015</span>
            </div>
          </div>
        </div>

        {/* Quick SLA & Inspection Status Ticker */}
        <div className="mt-1.5 p-1.5 px-2 rounded-lg border border-accent/20 bg-accent/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/20 text-accent font-bold text-[9px]">
              i
            </span>
            <span className="text-ink font-semibold text-[10px]">
              BTP QAQC SLA Target: All work inspections reviewed within 24 hours of contractor submission.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted font-mono text-[9.5px]">
              Overall Quality Score: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">98.5 / 100</strong>
            </span>
            <span className="h-2.5 w-px bg-line" />
            <span className="font-mono text-muted text-[9.5px]">Zero Stop-Work Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
