"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Cpu,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart as PieIcon,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  FileEdit,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, toolbarControlClass } from "@/components/PageHeader";
import { RecordModal, type RecordRow } from "@/components/RecordModal";
import { UnifiedEditFormModal } from "@/components/UnifiedEditFormModal";
import { BucketModal } from "@/components/BucketModal";
import { QAQCCalendar } from "@/components/QAQCCalendar";
import { ActionRequiredModal } from "@/components/ActionRequiredModal";
import { RegisterHealthModal } from "@/components/RegisterHealthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { TeamModal } from "@/components/TeamModal";
import { FormsBankModal } from "@/components/FormsBankModal";
import { GovernanceFormsView } from "@/components/GovernanceFormsView";
import { FormPdfViewerModal } from "@/components/FormPdfViewerModal";
import { ModernQualityAnalytics } from "@/components/ModernQualityAnalytics";
import { StaffDailyReportModal } from "@/components/StaffDailyReportModal";
import { DarSiteFormModal } from "@/components/DarSiteFormModal";
import { CompileSiteReportModal } from "@/components/CompileSiteReportModal";
import { DsrReportPrintViewerModal } from "@/components/DsrReportPrintViewerModal";
import { DsrRecord, getDsrRecords, getStaffDailyReports } from "@/lib/daily-reports";
import { GOVERNANCE_FORMS, type GovernanceFormTemplate } from "@/lib/governance-forms";
import { registerCatalog, registerByName, type RegisterCategory } from "@/lib/register-catalog";
import { getSavedStaffProfile, normalizeKey } from "@/lib/auth";
import "./dashboard.css";

type DashboardData = {
  project: string;
  sourceFile: string;
  snapshotAsOf: string;
  accConnected: boolean;
  note: string;
  dataQualityIssues: Array<{
    sheet: string;
    cell?: string;
    field?: string;
    issue: string;
    effect: string;
  }>;
  sheets: Array<{
    name: string;
    category?: string;
    records: number;
    parsed: boolean;
  }>;
  storageAvailable: boolean;
  records: RecordRow[];
};

type FilterMode = string;

const CATEGORIES: RegisterCategory[] = [
  "Inspection",
  "Submission",
  "Test",
];

const CATEGORY_META: Record<
  string,
  { title: string; description: string; classTag: string; shortLabel: string }
> = {
  Inspection: {
    title: "Site Work Inspections (RFWI)",
    description: "Requests for Work Inspection (Civil, Structural & Architectural)",
    classTag: "category-1",
    shortLabel: "RFWI",
  },
  Submission: {
    title: "Submissions, Governance & Surveillance",
    description: "MOS Revisions, ITP, Checklists, OJT, FOK List, RSS & SSR Surveillance",
    classTag: "category-0",
    shortLabel: "Submissions & Gov",
  },
  Test: {
    title: "QAQC Testing Records",
    description: "Cube tests, grout tests, plate load, FDT, and lab certificates",
    classTag: "category-2",
    shortLabel: "QAQC Tests",
  },
};

function localToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(val?: string | null): string {
  if (!val) return "—";
  const d = new Date(`${val}T00:00:00`);
  if (Number.isNaN(d.getTime())) return val;
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function isOpen(r: RecordRow): boolean {
  return r.state === "open";
}

function isOverdue(r: RecordRow, today: string): boolean {
  return isOpen(r) && Boolean(r.dueDate) && r.dueDate! < today;
}

function isDueSoon(r: RecordRow, today: string): boolean {
  if (!isOpen(r) || !r.dueDate || r.dueDate < today) return false;
  const target = new Date(`${today}T00:00:00`);
  target.setDate(target.getDate() + 7);
  const nextWeekStr = target.toISOString().slice(0, 10);
  return r.dueDate <= nextWeekStr;
}

function daysOverdue(dueDate?: string | null, today = localToday()): number {
  if (!dueDate || dueDate >= today) return 0;
  const d1 = new Date(`${today}T00:00:00`).getTime();
  const d2 = new Date(`${dueDate}T00:00:00`).getTime();
  return Math.max(1, Math.floor((d1 - d2) / 86400000));
}

function statusPillClass(status: string, state: string): string {
  const st = String(status || "").toLowerCase().trim();
  // Any status with pending, awaiting, review, open is AMBER/YELLOW
  if (/pending|await|in review|open acc/.test(st)) {
    return "bg-amber-100 text-amber-900 border border-amber-300/40 dark:bg-amber-950/40 dark:text-amber-300";
  }
  if (/rejected|failed|delay/i.test(st)) {
    return "bg-rose-100 text-rose-900 border border-rose-300/40 dark:bg-rose-950/40 dark:text-rose-300";
  }
  if (state === "closed" || /^(closed|passed|completed|approved|no objection)$/i.test(st)) {
    return "bg-emerald-100 text-emerald-900 border border-emerald-300/40 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  return "bg-sky-100 text-sky-900 border border-sky-300/40 dark:bg-sky-950/40 dark:text-sky-300";
}

export function Dashboard({
  user: initialUser,
  onLogout,
}: {
  user?: { name: string; email: string; role?: string };
  onLogout?: () => void;
} = {}) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  useEffect(() => {
    if (initialUser) {
      const key = normalizeKey(initialUser.email || initialUser.name || "damia");
      const saved = getSavedStaffProfile(key);
      if (saved?.name && typeof saved.name === "string" && saved.name.trim()) {
        setCurrentUser({ ...initialUser, name: saved.name.trim() });
      } else {
        setCurrentUser(initialUser);
      }
    }
  }, [initialUser]);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState("");

  const [activeSection, setActiveSection] = useState<"Overview" | "Registers" | "Team" | "Forms">("Overview");
  const [activeActionTab, setActiveActionTab] = useState<"all" | "overdue" | "pending" | "dueSoon">("all");

  // Filters for Registers view
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<RegisterCategory>("Inspection");
  const [statusFilter, setStatusFilter] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Sliding Show for 4 Category Boxes (Default: 3 = Quality Analytics)
  const [activeCategorySlide, setActiveCategorySlide] = useState(3);
  const [showAnalytics, setShowAnalytics] = useState(true);

  function prevCategorySlide() {
    setActiveCategorySlide((prev) => (prev === 0 ? 3 : prev - 1));
  }

  function nextCategorySlide() {
    setActiveCategorySlide((prev) => (prev === 3 ? 0 : prev + 1));
  }

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordRow | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalTab, setActionModalTab] = useState<"all" | "overdue" | "pending" | "dueSoon">("all");
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [formsBankModalOpen, setFormsBankModalOpen] = useState(false);

  // DSR & Staff Daily Activity Modals (accessible directly from QAQCCalendar and Profile)
  const [dsrCalendarOpen, setDsrCalendarOpen] = useState(false);
  const [dsrFormOpen, setDsrFormOpen] = useState(false);
  const [editingDsrId, setEditingDsrId] = useState<string | null>(null);
  const [initialDsrDate, setInitialDsrDate] = useState<string | undefined>(undefined);
  const [compileModalOpen, setCompileModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"dsr" | "monthly-personal" | "compiled-report">("dsr");
  const [printDsrRecord, setPrintDsrRecord] = useState<DsrRecord | null>(null);
  const [compiledReportData, setCompiledReportData] = useState<any | null>(null);
  const [monthlyPrintData, setMonthlyPrintData] = useState<any | null>(null);

  // Form PDF Generator Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTemplate, setPdfTemplate] = useState<GovernanceFormTemplate | null>(null);
  const [pdfRecord, setPdfRecord] = useState<RecordRow | null>(null);

  function openFormForRecord(r: RecordRow) {
    let tmpl = GOVERNANCE_FORMS.find((f) => f.id === "rfwi");
    if (r.category === "Submission" || (r.subcategory && r.subcategory.includes("MOS"))) {
      tmpl = GOVERNANCE_FORMS.find((f) => f.id === "mos") || tmpl;
    } else if (r.category === "NCR & Observation" || (r.subcategory && (r.subcategory.includes("RSS") || r.subcategory.includes("SSR")))) {
      tmpl = GOVERNANCE_FORMS.find((f) => f.id === "ncr") || tmpl;
    } else if (r.subcategory && r.subcategory.includes("ITP")) {
      tmpl = GOVERNANCE_FORMS.find((f) => f.id === "itp") || tmpl;
    } else if (r.subcategory && r.subcategory.includes("CHECKLIST")) {
      tmpl = GOVERNANCE_FORMS.find((f) => f.id === "chk") || tmpl;
    }
    setPdfTemplate(tmpl || GOVERNANCE_FORMS[0]);
    setPdfRecord(r);
    setPdfModalOpen(true);
  }

  const [bucketModal, setBucketModal] = useState<{
    open: boolean;
    title: string;
    bucketType: "pending" | "overdue" | "all";
    rows: RecordRow[];
  } | null>(null);

  const refreshData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      const payload = (await res.json()) as { error?: string } & DashboardData;
      if (!res.ok) throw new Error(payload.error || "Failed to load registers.");
      setData(payload);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading registers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
    const interval = setInterval(() => void refreshData(true), 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const rows = useMemo(() => data?.records ?? [], [data]);
  const today = localToday();

  // Overall Statistics
  const stats = useMemo(() => {
    const total = rows.length;
    const open = rows.filter(isOpen).length;
    const overdue = rows.filter((r) => isOverdue(r, today)).length;
    const dueSoon = rows.filter((r) => isDueSoon(r, today)).length;
    const closed = rows.filter((r) => r.state === "closed").length;
    return { total, open, overdue, dueSoon, closed };
  }, [rows, today]);

  // Action Required list
  const actionRequiredRows = useMemo(() => {
    return rows.filter((r) => isOpen(r) || isOverdue(r, today));
  }, [rows, today]);

  const filteredActionRows = useMemo(() => {
    if (activeActionTab === "overdue") {
      return actionRequiredRows.filter((r) => isOverdue(r, today));
    }
    if (activeActionTab === "pending") {
      return actionRequiredRows.filter((r) => !isOverdue(r, today) && isOpen(r));
    }
    if (activeActionTab === "dueSoon") {
      return actionRequiredRows.filter((r) => isDueSoon(r, today));
    }
    return actionRequiredRows;
  }, [actionRequiredRows, activeActionTab, today]);

  // Category & 22 Registers summary breakdown
  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat, idx) => {
      const catRows = rows.filter((r) => {
        const regDef = registerByName.get(r.subcategory);
        return (regDef?.category || r.category) === cat;
      });
      const registersInCat = registerCatalog.filter((r) => r.category === cat);

      const items = registersInCat.map((reg) => {
        const itemRows = catRows.filter((r) => r.subcategory === reg.name);
        const issued = itemRows.length;
        const closed = itemRows.filter((r) => r.state === "closed").length;
        const pending = itemRows.filter(isOpen).length;
        const overdue = itemRows.filter((r) => isOverdue(r, today)).length;
        return {
          name: reg.name,
          issued,
          closed,
          pending,
          overdue,
          rows: itemRows,
        };
      });

      const total = catRows.length;
      const closed = catRows.filter((r) => r.state === "closed").length;
      const pending = catRows.filter(isOpen).length;
      const overdue = catRows.filter((r) => isOverdue(r, today)).length;

      return {
        category: cat,
        meta: CATEGORY_META[cat],
        index: idx,
        total,
        closed,
        pending,
        overdue,
        items,
        rows: catRows,
      };
    });
  }, [rows, today]);

  // Category record counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: rows.length,
      Inspection: 0,
      Submission: 0,
      Test: 0,
    };
    for (const r of rows) {
      const regDef = registerByName.get(r.subcategory);
      const cat = regDef?.category || r.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    }
    return counts;
  }, [rows]);

  // Available subcategories filtered by chosen category
  const availableSubcategories = useMemo(() => {
    return registerCatalog.filter((r) => r.category === categoryFilter);
  }, [categoryFilter]);

  // Dynamically compute exact actual statuses from the current register/category
  const availableStatuses = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const regCat = registerByName.get(r.subcategory)?.category || r.category;
      if (regCat !== categoryFilter) continue;
      if (selectedSubcategory !== "ALL" && r.subcategory !== selectedSubcategory) continue;
      const st = r.status?.trim() || "Not recorded";
      map.set(st, (map.get(st) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [rows, categoryFilter, selectedSubcategory]);

  // Filtered rows for 22 Registers tab
  const filteredRegisters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sf = statusFilter.trim().toLowerCase();
    return rows.filter((r) => {
      const regCat = registerByName.get(r.subcategory)?.category || r.category;
      if (regCat !== categoryFilter) return false;
      if (selectedSubcategory !== "ALL" && r.subcategory !== selectedSubcategory) return false;

      if (sf !== "all") {
        if (statusFilter.startsWith("exact:")) {
          const target = statusFilter.slice("exact:".length).trim().toLowerCase();
          const rStatus = (r.status?.trim() || "Not recorded").toLowerCase();
          if (rStatus !== target) return false;
        } else if (sf === "sla:open" || sf === "open") {
          if (!isOpen(r)) return false;
        } else if (sf === "sla:closed" || sf === "closed") {
          if (r.state !== "closed") return false;
        } else if (sf === "sla:overdue" || sf === "overdue") {
          if (!isOverdue(r, today)) return false;
        } else if (sf === "sla:due-soon" || sf === "due-soon") {
          if (!isDueSoon(r, today)) return false;
        } else {
          // Exact status match against actual status in record
          const rStatus = (r.status?.trim() || "Not recorded").toLowerCase();
          if (rStatus !== sf) return false;
        }
      }

      if (!q) return true;
      return (
        r.refNo.toLowerCase().includes(q) ||
        (r.accRef && r.accRef.toLowerCase().includes(q)) ||
        r.title.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.discipline && r.discipline.toLowerCase().includes(q)) ||
        r.subcategory.toLowerCase().includes(q)
      );
    });
  }, [rows, categoryFilter, selectedSubcategory, statusFilter, searchQuery, today]);

  function openNewRecord() {
    setEditingRecord(null);
    setRecordModalOpen(true);
  }

  function openEditRecord(r: RecordRow) {
    setEditingRecord(r);
    setRecordModalOpen(true);
  }

  function handleRecordSaved(message: string, savedRecord?: RecordRow, openPdf?: boolean) {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
    void refreshData(true);
    if (openPdf && savedRecord) {
      openFormForRecord(savedRecord);
    }
  }

  function openBucket(title: string, bucketType: "pending" | "overdue" | "all", bucketRows: RecordRow[]) {
    setBucketModal({
      open: true,
      title,
      bucketType,
      rows: bucketRows,
    });
  }

  function exportCSV() {
    const cols = [
      "No",
      "Category",
      "Register",
      "Internal Reference",
      "ACC Reference",
      "Title / Description",
      "Discipline",
      "Location",
      "Status",
      "Record Date",
      "Target Due Date",
      "Notes",
    ];

    const escapeVal = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;

    const lines = [
      cols.map(escapeVal).join(","),
      ...filteredRegisters.map((r, i) =>
        [
          i + 1,
          r.category,
          r.subcategory,
          r.refNo,
          r.accRef || "",
          r.title,
          r.discipline || "",
          r.location || "",
          r.status,
          r.recordDate || "",
          r.dueDate || "",
          r.notes || "",
        ]
          .map(escapeVal)
          .join(","),
      ),
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SDSB_QAQC_Register_${selectedSubcategory === "ALL" ? "All_22_Registers" : selectedSubcategory}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={(section) => {
        if (section === "Forms") {
          setFormsBankModalOpen(true);
          return;
        }
        if (section === "Team") {
          setTeamModalOpen(true);
          return;
        }
        setActiveSection(section);
      }}
      onOpenNewRecord={openNewRecord}
      userName={currentUser?.name || "Nur Damia"}
      userRole={currentUser?.role || "Document Controller / Admin"}
      onLogout={onLogout}
      overdueCount={stats.overdue}
      openCount={stats.open}
      totalRecords={stats.total}
      activeRegistersCount={22}
      onOpenOverdue={() => {
        setActionModalTab(stats.overdue > 0 ? "overdue" : "all");
        setActionModalOpen(true);
      }}
      onOpenHealth={() => setHealthModalOpen(true)}
      onOpenProfile={() => setProfileModalOpen(true)}
      onOpenTeam={() => setTeamModalOpen(true)}
      onOpenFormsBank={() => setFormsBankModalOpen(true)}
      formsBankOpen={formsBankModalOpen}
      lastUpdated={lastUpdated}
      snapshotAsOf={data?.snapshotAsOf}
      sourceFile={data?.sourceFile}
    >
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void refreshData()}
            className="font-bold underline hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted">
          <Activity className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm font-semibold">Loading SDSB QAQC Registers...</p>
        </div>
      ) : activeSection === "Overview" ? (
        /* ================= OVERVIEW VIEW ================= */
        <div className="edms-dashboard">
          {/* Top 6 KPI Cards matching KLC-GEMAS-DEPOT */}
          <div className="edms-kpis">
            <button
              type="button"
              className="edms-kpi tone-0"
              onClick={() => {
                setCategoryFilter("ALL");
                setSelectedSubcategory("ALL");
                setStatusFilter("all");
                setActiveSection("Registers");
              }}
            >
              <span className="edms-kpi-icon">
                <FileSpreadsheet />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">TOTAL RECORDS</span>
                <strong>{stats.total.toLocaleString("en-MY")}</strong>
                <small>22 Registers Indexed</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>

            <button
              type="button"
              className="edms-kpi tone-1"
              onClick={() => {
                setActionModalTab("pending");
                setActionModalOpen(true);
              }}
            >
              <span className="edms-kpi-icon">
                <Clock />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">OPEN / PENDING</span>
                <strong>{stats.open.toLocaleString("en-MY")}</strong>
                <small>Awaiting Response</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>

            <button
              type="button"
              className="edms-kpi tone-2"
              onClick={() => {
                setActionModalTab("overdue");
                setActionModalOpen(true);
              }}
            >
              <span className="edms-kpi-icon">
                <ShieldAlert />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">DATED OVERDUE</span>
                <strong>{stats.overdue}</strong>
                <small>Past Target Date</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>

            <button
              type="button"
              className="edms-kpi tone-3"
              onClick={() => {
                setActionModalTab("dueSoon");
                setActionModalOpen(true);
              }}
            >
              <span className="edms-kpi-icon">
                <Activity />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">DUE IN 7 DAYS</span>
                <strong>{stats.dueSoon}</strong>
                <small>Target Deadlines</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>

            <button
              type="button"
              className="edms-kpi tone-4"
              onClick={() => {
                setCategoryFilter("ALL");
                setSelectedSubcategory("ALL");
                setStatusFilter("closed");
                setActiveSection("Registers");
              }}
            >
              <span className="edms-kpi-icon">
                <FileCheck2 />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">CLOSED / PASSED</span>
                <strong>{stats.closed.toLocaleString("en-MY")}</strong>
                <small>Completed Records</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>

            <button
              type="button"
              className="edms-kpi tone-5"
              onClick={() => {
                setActiveSection("Registers");
              }}
            >
              <span className="edms-kpi-icon">
                <ClipboardList />
              </span>
              <div className="min-w-0">
                <span className="edms-kpi-label">INTERNAL REGISTER</span>
                <strong>22</strong>
                <small>Submittal, RFWI, Test, NCR</small>
              </div>
              <ChevronRight className="edms-chevron" />
            </button>
          </div>

          {/* Two-Column Workspace: Left Calendar + Right 3 Category Panels (matching KLC-GEMAS-DEPOT) */}
          <div className="edms-workspace">
            {/* Left: QAQC Calendar Schedule (KLC-GEMAS-DEPOT Style) */}
            <div className="edms-calendar-column">
              <QAQCCalendar
                records={rows}
                onSelectRecord={openEditRecord}
                onOpenNewRecord={openNewRecord}
                onOpenDsrCalendar={() => setDsrCalendarOpen(true)}
              />
            </div>

            {/* Right: 4 Showcase Panels in a Sliding Show (RFWI, Submissions, QAQC Tests, Analytics) */}
            <div className="edms-categories h-full min-h-0 flex flex-col min-w-0 overflow-hidden">
              {/* Section Heading & Slide Controls */}
              <div className="edms-section-heading shrink-0 flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="edms-heading-icon">
                    {activeCategorySlide === 3 ? (
                      <PieIcon className="h-5 w-5" />
                    ) : (
                      <ClipboardList className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h1 className="flex items-center gap-2">
                      {activeCategorySlide === 3 ? (
                        <>
                          <span>Quality Analytics</span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Live
                          </span>
                        </>
                      ) : (
                        <>
                          <span>22 Registers</span>
                          <span className="text-xs font-semibold text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded-full">
                            {categoryBreakdown[activeCategorySlide]?.meta.shortLabel || "RFWI"}
                          </span>
                        </>
                      )}
                    </h1>
                    <p className="text-[11px] text-muted">
                      {activeCategorySlide === 3
                        ? "Status & trade package breakdown"
                        : `Slide ${activeCategorySlide + 1} of 4 · Grouped register records`}
                    </p>
                  </div>
                </div>

                {/* Arrow navigation and category selector tabs */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-paper/60 border border-line rounded-lg p-0.5 shadow-2xs">
                    {categoryBreakdown.map((cat, idx) => (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setActiveCategorySlide(idx)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                          activeCategorySlide === idx
                            ? "bg-accent text-white shadow-xs"
                            : "text-muted hover:text-ink hover:bg-field"
                        }`}
                        title={cat.meta.title}
                      >
                        {cat.meta.shortLabel || cat.category}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveCategorySlide(3)}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        activeCategorySlide === 3
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-ink hover:bg-field"
                      }`}
                      title="Quality Analytics & Donut Distribution"
                    >
                      <PieIcon className="h-3 w-3" />
                      <span>Analytics</span>
                    </button>
                  </div>

                  {/* Left and Right Arrow Buttons */}
                  <div className="flex items-center border border-line rounded-lg bg-paper overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={prevCategorySlide}
                      className="grid h-7 w-7 place-items-center text-muted hover:text-ink hover:bg-field cursor-pointer transition"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[11px] font-bold text-ink px-2 border-x border-line">
                      {activeCategorySlide + 1} / 4
                    </span>
                    <button
                      type="button"
                      onClick={nextCategorySlide}
                      className="grid h-7 w-7 place-items-center text-muted hover:text-ink hover:bg-field cursor-pointer transition"
                      title="Next Slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Track with Smooth Transition */}
              <div className="relative flex-1 min-h-0 overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-sm">
                <div
                  className="flex h-full w-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${activeCategorySlide * 100}%)` }}
                >
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="w-full shrink-0 h-full flex flex-col p-1.5">
                      <article className={`edms-category ${cat.meta.classTag} h-full flex flex-col border border-line rounded-xl overflow-hidden`}>
                        <div className="edms-category-heading shrink-0 flex items-center justify-between px-3 py-2 border-b border-line bg-paper/50">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="edms-category-icon">
                              <FileCheck2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <h2 className="text-sm font-extrabold text-ink truncate">{cat.meta.title}</h2>
                              <p className="text-[11px] text-muted">{cat.items.length} registers · {cat.total} total rows</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <span className="rounded-md bg-paper/80 px-2 py-0.5 text-muted border border-line text-[11px]">
                              {cat.closed} Closed
                            </span>
                            <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 border border-amber-500/25 font-bold text-[11px]">
                              {cat.pending} Pending
                            </span>
                          </div>
                        </div>

                        <div className="edms-category-body flex-1 min-h-0 overflow-y-auto p-2">
                          {/* Column labels */}
                          <div className="edms-category-row edms-column-labels shrink-0 sticky top-0 z-10 mb-1" aria-hidden="true">
                            <span>Register Tab</span>
                            <span>Issued</span>
                            <span>Closed</span>
                            <span>Pending</span>
                            <span>Overdue</span>
                            <span />
                          </div>

                          {/* Register Rows */}
                          {cat.items.map((reg) => (
                            <div key={reg.name} className="edms-category-row">
                              <div className="flex flex-col min-w-0 pr-1">
                                <button
                                  type="button"
                                  className="edms-category-title truncate text-left font-semibold text-ink hover:text-accent transition"
                                  title={`Open ${reg.name}`}
                                  onClick={() => {
                                    setSelectedSubcategory(reg.name);
                                    setCategoryFilter(cat.category);
                                    setStatusFilter("all");
                                    setActiveSection("Registers");
                                  }}
                                >
                                  {reg.name}
                                </button>
                                {reg.issued > 0 && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-16 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(100, Math.round((reg.closed / reg.issued) * 100))}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[9px] font-mono text-muted">
                                      {Math.round((reg.closed / reg.issued) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className={reg.issued === 0 ? "is-zero" : ""}>
                                {reg.issued}
                              </span>
                              <span className={reg.closed === 0 ? "is-zero" : ""}>
                                {reg.closed}
                              </span>
                              <button
                                type="button"
                                className={`edms-pending ${reg.pending === 0 ? "is-zero" : ""}`}
                                onClick={() => openBucket(`${reg.name} Pending`, "pending", reg.rows.filter(isOpen))}
                              >
                                {reg.pending}
                              </button>
                              <button
                                type="button"
                                className={`edms-overdue ${reg.overdue === 0 ? "is-zero" : ""}`}
                                onClick={() => openBucket(`${reg.name} Overdue`, "overdue", reg.rows.filter((r) => isOverdue(r, today)))}
                              >
                                {reg.overdue}
                              </button>
                              <button
                                type="button"
                                className="edms-row-arrow"
                                onClick={() => {
                                  setSelectedSubcategory(reg.name);
                                  setCategoryFilter(cat.category);
                                  setStatusFilter("all");
                                  setActiveSection("Registers");
                                }}
                              >
                                ›
                              </button>
                            </div>
                          ))}
                        </div>
                      </article>
                    </div>
                  ))}

                  {/* 4th Slide: Modern Quality Analytics & Interactive Donut Chart */}
                  <div key="analytics-slide" className="w-full shrink-0 h-full flex flex-col p-1 overflow-hidden">
                    <ModernQualityAnalytics
                      records={rows}
                      onFilterStatus={(st) => {
                        setStatusFilter(st as any);
                        setActiveSection("Registers");
                      }}
                      onFilterDiscipline={(disc) => {
                        setSelectedSubcategory(disc === "Civil" ? "RFWI A C&S" : disc === "Architectural" ? "RFWI A ARC" : "ALL");
                        setActiveSection("Registers");
                      }}
                      onOpenActionModal={(tab) => {
                        setActionModalTab(tab);
                        setActionModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeSection === "Forms" ? (
        /* ================= BTP GOVERNANCE FORMS & PDF ENGINE ================= */
        <GovernanceFormsView
          registerRecords={data?.records || []}
          onBackToOverview={() => setActiveSection("Overview")}
        />
      ) : (
        /* ================= 22 REGISTERS (EXCEL VIEW) ================= */
        <div className="flex flex-col gap-4">
          <PageHeader
            title="22 QAQC Registers"
            description={`Viewing: ${categoryFilter} ${selectedSubcategory !== "ALL" ? `➔ ${selectedSubcategory}` : `(${availableSubcategories.length} Registers)`} (${filteredRegisters.length} rows)`}
            actions={
              <div className="flex w-full flex-wrap items-center justify-end gap-2">
                {/* 1. Category Filter Dropdown (Inspection, Submission, Test) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider hidden md:inline">Category:</span>
                  <select
                    aria-label="Filter Category"
                    className="form-control h-10 w-44 shrink-0 rounded-lg border border-line bg-field px-2.5 text-xs font-semibold text-ink"
                    value={categoryFilter}
                    onChange={(e) => {
                      const newCat = e.target.value as RegisterCategory;
                      setCategoryFilter(newCat);
                      setSelectedSubcategory("ALL");
                      setStatusFilter("all");
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c} ({categoryCounts[c] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Sub-Register Filter Dropdown (Cascaded by Category) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider hidden md:inline">Sub:</span>
                  <select
                    aria-label="Select Sub-Register"
                    className="form-control h-10 w-60 shrink-0 truncate rounded-lg border border-line bg-field px-2.5 text-xs font-semibold text-ink"
                    value={selectedSubcategory}
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value);
                    }}
                  >
                    <option value="ALL">
                      All {categoryFilter} ({categoryCounts[categoryFilter] || 0})
                    </option>
                    {availableSubcategories.map((r) => {
                      const count = rows.filter((row) => row.subcategory === r.name).length;
                      return (
                        <option key={r.name} value={r.name}>
                          {r.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 3. Status Filter (Dynamic & Tally with Actual Register Statuses) */}
                <select
                  aria-label="Filter Status"
                  className="form-control h-10 w-48 shrink-0 truncate rounded-lg border border-line bg-field px-2.5 text-xs font-semibold text-ink"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">
                    All Statuses ({rows.filter((r) => {
                      const regCat = registerByName.get(r.subcategory)?.category || r.category;
                      if (regCat !== categoryFilter) return false;
                      if (selectedSubcategory !== "ALL" && r.subcategory !== selectedSubcategory) return false;
                      return true;
                    }).length})
                  </option>

                  {availableStatuses.length > 0 && (
                    <optgroup label="── ACTUAL REGISTER STATUSES ──">
                      {availableStatuses.map(([stName, count]) => (
                        <option key={stName} value={`exact:${stName}`}>
                          {stName} ({count})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="── SLA & TARGET TIMELINE ──">
                    <option value="sla:open">All Open / Pending</option>
                    <option value="sla:closed">All Closed / Passed</option>
                    <option value="sla:overdue">Dated Overdue</option>
                    <option value="sla:due-soon">Due in 7 Days</option>
                  </optgroup>
                </select>

                {/* Search Box */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search ref, title, block..."
                    className="form-control h-10 w-full rounded-lg border border-line bg-field pl-8 pr-3 text-xs text-ink placeholder:text-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={exportCSV}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line bg-field px-3 text-xs font-semibold text-ink hover:border-accent hover:text-accent cursor-pointer"
                  title="Export filtered records to CSV"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  <span>Export</span>
                </button>

                {/* Add Record Button */}
                <button
                  type="button"
                  onClick={openNewRecord}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow hover:brightness-110 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Record</span>
                </button>
              </div>
            }
          />

          {/* Data Table / Spreadsheet View */}
          <div className="overflow-hidden rounded-xl border border-line bg-paper-elevated shadow-sm">
            <div className="max-h-[calc(100vh-230px)] overflow-auto">
              <table className="w-full min-w-[1420px] text-left text-xs border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "270px" }} />
                  <col style={{ width: "130px" }} />
                  <col style={{ width: "auto" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "195px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "130px" }} />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur text-muted">
                  <tr>
                    <th className="p-2.5 font-bold uppercase text-center whitespace-nowrap">No</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Register</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Internal Reference</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">ACC Reference</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Title / Subject</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Location</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Status</th>
                    <th className="p-2.5 font-bold uppercase whitespace-nowrap">Target Date</th>
                    <th className="p-2.5 font-bold uppercase text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredRegisters.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted">
                        No records match the selected filter. Try changing category, status, or search term.
                      </td>
                    </tr>
                  ) : (
                    filteredRegisters.slice(0, 500).map((r, i) => {
                      const late = isOverdue(r, today);
                      return (
                        <tr
                          key={r.id}
                          onClick={() => openEditRecord(r)}
                          className="hover:bg-teal-50/50 dark:hover:bg-accent/10 transition cursor-pointer"
                        >
                          <td className="p-2.5 text-center text-muted font-mono whitespace-nowrap">{i + 1}</td>
                          <td className="p-2.5 font-semibold text-accent whitespace-nowrap">
                            <span className="truncate block" title={r.subcategory}>
                              {r.subcategory}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold font-mono text-ink whitespace-nowrap tracking-tight">
                            {r.refNo}
                          </td>
                          <td className="p-2.5 text-muted font-mono text-[11px] whitespace-nowrap">
                            {r.accRef || "—"}
                          </td>
                          <td className="p-2.5 font-medium text-ink min-w-[340px]">
                            <span className="line-clamp-2" title={r.title}>
                              {r.title}
                            </span>
                          </td>
                          <td className="p-2.5 text-muted max-w-[160px] truncate" title={r.location || ""}>
                            <span className="truncate block" title={r.location}>
                              {r.location || "—"}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusPillClass(
                                r.status,
                                r.state,
                              )}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={late ? "font-bold text-red-600 dark:text-red-400" : "text-ink"}>
                              {formatDate(r.dueDate)}
                            </span>
                            {late && (
                              <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                                Overdue ({daysOverdue(r.dueDate, today)}d)
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              title="Edit record details and live preview official form"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:border-accent hover:bg-accent hover:text-white transition shadow-2xs cursor-pointer whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditRecord(r);
                              }}
                            >
                              <FileEdit className="h-3.5 w-3.5" />
                              <span>Edit Form</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="flex flex-wrap items-center justify-between border-t border-line bg-paper/40 p-2.5 text-xs text-muted">
              <span>
                Showing {Math.min(filteredRegisters.length, 500)} of {filteredRegisters.length} records
              </span>
              <span>Click any row to update or edit record data</span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Record Edit & Live Form Preview Modal (Kiri Edit Form, Kanan Live Preview) */}
      <UnifiedEditFormModal
        open={recordModalOpen}
        editing={editingRecord}
        onClose={() => {
          setRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSaved={handleRecordSaved}
        storageAvailable={data?.storageAvailable}
        existingRecords={rows}
        defaultSubcategory={selectedSubcategory !== "ALL" ? selectedSubcategory : "RFWI A C&S"}
        defaultCategory={categoryFilter}
      />

      {/* Bucket Drilldown Modal */}
      {bucketModal && (
        <BucketModal
          open={bucketModal.open}
          title={bucketModal.title}
          bucketType={bucketModal.bucketType}
          rows={bucketModal.rows}
          onClose={() => setBucketModal(null)}
          onSelectRow={openEditRecord}
        />
      )}

      {/* Action Required Queue Modal */}
      <ActionRequiredModal
        open={actionModalOpen}
        rows={rows}
        today={today}
        initialTab={actionModalTab}
        onClose={() => setActionModalOpen(false)}
        onSelectRow={openEditRecord}
      />

      {/* Internal Register Health & System Checks Modal */}
      <RegisterHealthModal
        open={healthModalOpen}
        totalRecords={rows.length}
        snapshotAsOf={data?.snapshotAsOf}
        sourceFile={data?.sourceFile}
        storageAvailable={data?.storageAvailable}
        issues={data?.dataQualityIssues}
        onClose={() => setHealthModalOpen(false)}
      />

      {/* User Profile Modal (DAMIA - Document Controller & System Admin) */}
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onSave={(updatedProfile) => {
          const updated = {
            name: updatedProfile.name,
            role: updatedProfile.role,
            email: updatedProfile.email,
          };
          setCurrentUser(updated);
          setToast(`Profile updated: ${updatedProfile.name}`);
        }}
      />

      {/* Project Team Modal */}
      <TeamModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />

      {/* BTP Governance Forms Bank & PDF Engine Modal */}
      <FormsBankModal
        open={formsBankModalOpen}
        onClose={() => setFormsBankModalOpen(false)}
        registerRecords={data?.records || []}
        onOpenPdfViewer={(template, rec) => {
          setPdfTemplate(template);
          setPdfRecord(rec || null);
          setPdfModalOpen(true);
        }}
      />

      {/* Form PDF Viewer & Generator Modal */}
      <FormPdfViewerModal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        template={pdfTemplate}
        registerRecords={data?.records || []}
        initialRecord={pdfRecord}
      />

      {/* Staff Daily Report / Personal Activity Calendar Modal (Direct Access from Front Calendar & Profile) */}
      <StaffDailyReportModal
        open={dsrCalendarOpen}
        onClose={() => setDsrCalendarOpen(false)}
        userName={currentUser.name}
        userRole={currentUser.role}
        onOpenCreateDsr={(date) => {
          setInitialDsrDate(date);
          setEditingDsrId(null);
          setDsrFormOpen(true);
        }}
        onOpenViewDsr={(dsrId) => {
          setEditingDsrId(dsrId);
          setDsrFormOpen(true);
        }}
        onOpenCompile={() => {
          setDsrCalendarOpen(false);
          setCompileModalOpen(true);
        }}
        onPrintMonthlyReport={(year, month) => {
          const acts = getStaffDailyReports();
          setMonthlyPrintData({
            year,
            month,
            userName: currentUser.name,
            userRole: currentUser.role,
            activities: acts,
          });
          setPrintMode("monthly-personal");
          setPrintModalOpen(true);
        }}
      />

      {/* DSR Site Report Creation & View Modal */}
      <DarSiteFormModal
        open={dsrFormOpen}
        onClose={() => setDsrFormOpen(false)}
        initialDate={initialDsrDate}
        editDsrId={editingDsrId}
        userName={currentUser.name}
        onSaved={() => {
          // Saved callback
        }}
        onPrintDsr={(record) => {
          setPrintDsrRecord(record);
          setPrintMode("dsr");
          setPrintModalOpen(true);
        }}
      />

      {/* Compile Site Report (Weekly / Monthly) Modal */}
      <CompileSiteReportModal
        open={compileModalOpen}
        onClose={() => setCompileModalOpen(false)}
        userName={currentUser.name}
        onCompileReport={(report) => {
          setCompiledReportData(report);
          setPrintMode("compiled-report");
          setPrintModalOpen(true);
        }}
      />

      {/* Printable Report Viewer Modal */}
      <DsrReportPrintViewerModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        mode={printMode}
        dsr={printDsrRecord}
        monthlyData={monthlyPrintData}
        compiledReport={compiledReportData}
      />

      {/* Feedback Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-2xl shadow-black/40"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </AppShell>
  );
}
