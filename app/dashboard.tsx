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
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, toolbarControlClass } from "@/components/PageHeader";
import { RecordModal, type RecordRow } from "@/components/RecordModal";
import { UnifiedEditFormModal } from "@/components/UnifiedEditFormModal";
import { BucketModal } from "@/components/BucketModal";
import { ScancopyViewerModal } from "@/components/ScancopyViewerModal";
import { hasScancopySync, initializeSampleScancopyIfEmpty } from "@/lib/scancopy-storage";
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
import { MOS_COMPARISON_META } from "@/lib/mos-comparison-data";
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
    description: "MOS Comparison, ITP, Checklists, OJT, FOK List, RSS & SSR Surveillance",
    classTag: "category-0",
    shortLabel: "Submissions",
  },
  Test: {
    title: "QAQC Testing Records",
    description: "Cube tests, grout tests, plate load, FDT, and lab certificates",
    classTag: "category-2",
    shortLabel: "QAQC Tests",
  },
};

const REGISTER_SUBJECT_TITLES: Record<string, string> = {
  "MOS Comparison": "MOS Comparison",
  "ITP": "INSPECTION & TEST PLAN (ITP)",
  "CHECKLIST": "QAQC INSPECTION CHECKLIST",
  "OJT": "ON-THE-JOB TRAINING (OJT)",
  "FOK LIST": "FIRST OF KIND (FOK) INSPECTION LIST",
  "RSS SUMMARY": "RESIDENT SITE STAFF (RSS) SURVEILLANCE SUMMARY",
  "SSR SUMMARY": "SITE SURVEILLANCE REPLY (SSR) SUMMARY",
  "RFWI A C&S": "RFWI - BLOCK A - C&S",
  "RFWI B C&S": "RFWI - BLOCK B - C&S",
  "RFWI C C&S": "RFWI - BLOCK C - C&S",
  "RFWI F C&S": "RFWI - BLOCK F - C&S",
  "RFWI A ARC": "RFWI - BLOCK A - ARC",
  "RFWI B ARC": "RFWI - BLOCK B - ARC",
  "CUBE TEST EW": "CONCRETE CUBE TEST - EARTHWORK (EW)",
  "CUBE TEST BLOCK A": "CONCRETE CUBE TEST - BLOCK A",
  "CUBE TEST BLOCK B": "CONCRETE CUBE TEST - BLOCK B",
  "GROUT TEST BLOCK A": "GROUT TEST - BLOCK A",
  "GROUT TEST BLOCK B": "GROUT TEST - BLOCK B",
  "FDT TEST": "FIELD DENSITY TEST (FDT)",
  "PILE TEST DATE": "PILE TESTING RECORD (ACC)",
  "PLATE LOAD BEARING TEST": "PLATE LOAD BEARING TEST",
  "LAB SUMMARY": "QAQC LABORATORY SUMMARY",
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
      const effectiveName =
        (saved?.name && typeof saved.name === "string" && saved.name.trim()) ||
        initialUser.name ||
        "Nur Damia";
      let effectiveRole =
        (saved?.role && typeof saved.role === "string" && saved.role.trim()) ||
        initialUser.role ||
        "QAQC DC";
      if (key === "damia" && (!effectiveRole || effectiveRole.includes("Document Controller & QAQC Admin"))) {
        effectiveRole = "QAQC DC";
      }
      const effectiveEmail =
        (saved?.email && typeof saved.email === "string" && saved.email.trim()) ||
        initialUser.email;

      setCurrentUser({
        ...initialUser,
        name: effectiveName,
        role: effectiveRole,
        email: effectiveEmail,
      });
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

  // Closed Scancopy PDF Viewer & Upload Modal
  const [scancopyRecord, setScancopyRecord] = useState<RecordRow | null>(null);
  const [scancopyVersion, setScancopyVersion] = useState(0);

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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server returned status ${res.status}`);
      }
      const payload = (await res.json()) as DashboardData;
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
    initializeSampleScancopyIfEmpty();
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
        r.subcategory.toLowerCase().includes(q) ||
        (r.trade && r.trade.toLowerCase().includes(q)) ||
        (r.workItem && r.workItem.toLowerCase().includes(q)) ||
        (r.accRefA && r.accRefA.toLowerCase().includes(q)) ||
        (r.descriptionA && r.descriptionA.toLowerCase().includes(q)) ||
        (r.accRefB && r.accRefB.toLowerCase().includes(q)) ||
        (r.descriptionB && r.descriptionB.toLowerCase().includes(q))
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
    const escapeVal = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const isMosComparisonView = selectedSubcategory === "MOS Comparison";

    const cols = isMosComparisonView
      ? [
          "NO",
          "Trade",
          "Description / Work Item",
          "ACC Ref A",
          "Description A",
          "Acc Ref B",
          "Description B",
        ]
      : [
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

    const lines = [
      cols.map(escapeVal).join(","),
      ...filteredRegisters.map((r, i) =>
        (isMosComparisonView
          ? [
              i + 1,
              r.trade || "C&S",
              r.workItem || r.title || "",
              r.accRefA || "",
              r.descriptionA || "",
              r.accRefB || "",
              r.descriptionB || "",
            ]
          : [
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
        )
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
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1 bg-paper/60 border border-line rounded-lg p-0.5 shadow-2xs w-full sm:w-auto">
                    {categoryBreakdown.map((cat, idx) => (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setActiveCategorySlide(idx)}
                        className={`flex-1 sm:flex-initial text-center rounded-md px-2 sm:px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
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
                      className={`flex-1 sm:flex-initial text-center flex items-center justify-center gap-1 rounded-md px-2 sm:px-2.5 py-1 text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                        activeCategorySlide === 3
                          ? "bg-accent text-white shadow-xs"
                          : "text-muted hover:text-ink hover:bg-field"
                      }`}
                      title="Quality Analytics & Donut Distribution"
                    >
                      <PieIcon className="h-3 w-3 shrink-0" />
                      <span>Analytics</span>
                    </button>
                  </div>

                  {/* Left and Right Arrow Buttons - Hidden on Mobile */}
                  <div className="hidden sm:flex items-center border border-line rounded-lg bg-paper overflow-hidden shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={prevCategorySlide}
                      className="grid h-7 w-7 place-items-center text-muted hover:text-ink hover:bg-field cursor-pointer transition"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[11px] font-bold text-ink px-2 border-x border-line whitespace-nowrap">
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Sebaris Title & Counter on Mobile / Desktop */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="display text-lg sm:text-2xl font-bold uppercase tracking-tight text-ink truncate">
                  22 QAQC Registers
                </h1>
                <span className="rounded-full bg-accent/15 border border-accent/25 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-accent shrink-0">
                  {filteredRegisters.length} rows
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-muted truncate text-right">
                {categoryFilter} {selectedSubcategory !== "ALL" ? `· ${selectedSubcategory}` : `(${availableSubcategories.length})`}
              </span>
            </div>

            {/* Filter Controls - Clean & Space-Efficient Grid on Mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-2">
              {/* Row 1 on Mobile: Category & Sub-Register (50 / 50 sama ratio) */}
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                <div className="relative min-w-0">
                  <select
                    aria-label="Filter Category"
                    className="form-control h-9 w-full sm:w-44 truncate rounded-lg border border-line bg-field pl-2.5 pr-7 text-xs font-semibold text-ink appearance-none cursor-pointer shadow-2xs"
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
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                </div>

                <div className="relative min-w-0">
                  <select
                    aria-label="Select Sub-Register"
                    className="form-control h-9 w-full sm:w-56 truncate rounded-lg border border-line bg-field pl-2.5 pr-7 text-xs font-semibold text-ink appearance-none cursor-pointer shadow-2xs"
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
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Row 2 on Mobile: Status & Search (Compact on Mobile) */}
              <div className="grid grid-cols-1 sm:flex sm:w-auto gap-2 w-full sm:items-center">
                {/* Status Dropdown */}
                <div className="relative min-w-0 sm:w-48">
                  <select
                    aria-label="Filter Status"
                    className="form-control h-9 w-full truncate rounded-lg border border-line bg-field pl-2.5 pr-7 text-xs font-semibold text-ink appearance-none cursor-pointer shadow-2xs"
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
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                </div>

                {/* Search Box */}
                <div className="relative min-w-0 flex-1 sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search ref, title, block..."
                    className="form-control h-9 w-full rounded-lg border border-line bg-field pl-8 pr-3 text-xs text-ink placeholder:text-muted/60 shadow-2xs focus:border-accent focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3 on Mobile: Export & Add Record Buttons (50 / 50 sama ratio) */}
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
                <button
                  type="button"
                  onClick={exportCSV}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-field px-3 text-xs font-semibold text-ink hover:border-accent hover:text-accent cursor-pointer shadow-2xs transition"
                  title="Export filtered records to CSV"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={openNewRecord}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-xs hover:brightness-110 cursor-pointer transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record</span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Table / Spreadsheet View */}
          <div className="overflow-hidden rounded-xl border border-line bg-paper-elevated shadow-sm">
            {/* Official BTP Google Sheets Header Banner for all 22 Registers */}
            <div className="border-b border-slate-300 dark:border-slate-700">
              <div className="bg-[#0f3b68] px-4 py-2 text-white font-bold text-sm sm:text-base tracking-wide uppercase flex items-center justify-between gap-2">
                <span>PROJECT NAME: {MOS_COMPARISON_META.projectName}</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-white/15 px-2.5 py-0.5 rounded border border-white/20">
                  {selectedSubcategory === "ALL" ? `All ${categoryFilter} Registers` : selectedSubcategory}
                </span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/90 px-4 py-2.5 text-xs">
                <div className="flex flex-col justify-center space-y-1 font-bold text-slate-900 dark:text-slate-100">
                  <div>PACKAGE: {MOS_COMPARISON_META.packageName}</div>
                  <div>
                    SUBJECT:{" "}
                    {selectedSubcategory === "ALL"
                      ? CATEGORY_META[categoryFilter]?.title.toUpperCase() || categoryFilter.toUpperCase()
                      : REGISTER_SUBJECT_TITLES[selectedSubcategory] || selectedSubcategory}
                  </div>
                </div>

                {/* Floating Standalone Boxes for Status Summary & Revision Date */}
                <div className="flex flex-wrap items-stretch gap-3">
                  {/* Floating Box 1: Status Summary */}
                  <div className="rounded-xl border border-slate-300/90 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm px-3.5 py-1.5 flex flex-col justify-center min-w-[240px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-1">
                      Status Summary
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                        Closed: {filteredRegisters.filter((r) => r.state === "closed").length}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                        Pending: {filteredRegisters.filter((r) => r.state === "open").length}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-slate-800 dark:text-slate-100">
                        Total: {filteredRegisters.length}
                      </span>
                    </div>
                  </div>

                  {/* Floating Box 2: Revision Date */}
                  <div className="rounded-xl border border-amber-300/90 dark:border-amber-700/70 bg-white dark:bg-slate-800/90 shadow-sm px-4 py-1.5 flex flex-col justify-center items-center min-w-[175px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-1">
                      Revision Date
                    </div>
                    <div className="rounded-md bg-[#fff2cc] dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-700/60 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-900 dark:text-amber-200 tracking-tight">
                      {MOS_COMPARISON_META.revisionDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-paper/60 border-b border-line text-[11px] text-muted">
              <span>{filteredRegisters.length} records</span>
              <span className="font-semibold text-accent flex items-center gap-1">
                <span>⇄ Swipe horizontally</span>
              </span>
            </div>
            <div className="max-h-[calc(100vh-230px)] max-sm:max-h-[calc(100dvh-280px)] overflow-x-auto overflow-y-auto overscroll-x-contain">
              {selectedSubcategory === "MOS Comparison" ? (
                <table className="w-full min-w-[1280px] text-left text-xs border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: "54px" }} />
                    <col style={{ width: "76px" }} />
                    <col style={{ width: "260px" }} />
                    <col style={{ width: "145px" }} />
                    <col style={{ width: "260px" }} />
                    <col style={{ width: "145px" }} />
                    <col style={{ width: "260px" }} />
                    <col style={{ width: "155px" }} />
                  </colgroup>
                  <thead className="sticky top-0 z-10 border-b-2 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                    <tr>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        NO
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Trade
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Description / Work Item
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        ACC Ref A
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Description A
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#c6e0b4] dark:bg-emerald-950/90 border-r border-slate-300 dark:border-slate-700">
                        Acc Ref B
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#c6e0b4] dark:bg-emerald-950/90 border-r border-slate-300 dark:border-slate-700">
                        Description B
                      </th>
                      <th className="p-2.5 font-bold uppercase text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300/80 dark:divide-slate-700/70">
                    {filteredRegisters.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted">
                          No records match the selected filter. Try changing status or search term.
                        </td>
                      </tr>
                    ) : (
                      filteredRegisters.slice(0, 500).map((r, i) => {
                        const accRefA = r.accRefA ?? "";
                        const descA = r.descriptionA ?? "";
                        const accRefB = r.accRefB ?? "";
                        const descB = r.descriptionB ?? "";
                        const isPendingA = /pending/i.test(accRefA);
                        const isPendingB = /pending/i.test(accRefB);
                        return (
                          <tr
                            key={r.id}
                            onClick={() => openEditRecord(r)}
                            className="hover:brightness-95 transition cursor-pointer"
                          >
                            <td className="p-2 text-center font-medium text-ink bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="p-2 text-center font-semibold text-ink bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                              {r.trade || "C&S"}
                            </td>
                            <td className="p-2 font-medium text-ink bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                              <span className="line-clamp-2" title={r.workItem || r.title}>
                                {r.workItem || r.title}
                              </span>
                            </td>
                            <td
                              className={`p-2 text-center border-r border-slate-300/70 dark:border-slate-700/70 bg-[#d9e1f2] dark:bg-sky-950/35 whitespace-nowrap ${
                                isPendingA
                                  ? "italic text-slate-700 dark:text-amber-300 font-medium"
                                  : "font-semibold text-slate-900 dark:text-sky-100"
                              }`}
                            >
                              {accRefA || ""}
                            </td>
                            <td className="p-2 border-r border-slate-300/70 dark:border-slate-700/70 bg-[#d9e1f2] dark:bg-sky-950/35 text-slate-900 dark:text-sky-100">
                              <span className="line-clamp-2" title={descA}>
                                {descA}
                              </span>
                            </td>
                            <td
                              className={`p-2 text-center border-r border-slate-300/70 dark:border-slate-700/70 bg-[#e2efda] dark:bg-emerald-950/35 whitespace-nowrap ${
                                isPendingB
                                  ? "italic text-slate-700 dark:text-amber-300 font-medium"
                                  : "font-semibold text-slate-900 dark:text-emerald-100"
                              }`}
                            >
                              {accRefB || ""}
                            </td>
                            <td className="p-2 border-r border-slate-300/70 dark:border-slate-700/70 bg-[#e2efda] dark:bg-emerald-950/35 text-slate-900 dark:text-emerald-100">
                              <span className="line-clamp-2" title={descB}>
                                {descB}
                              </span>
                            </td>
                            <td className="p-2 text-center bg-white dark:bg-slate-900 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  title="Edit record details and live preview official form"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent hover:border-accent hover:bg-accent hover:text-white transition shadow-2xs cursor-pointer whitespace-nowrap"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditRecord(r);
                                  }}
                                >
                                  <FileEdit className="h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  title={hasScancopySync(r.refNo) ? "Preview signed scancopy PDF" : "Attach signed scancopy PDF"}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                                    hasScancopySync(r.refNo)
                                      ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white shadow-2xs"
                                      : "border-line bg-paper/60 text-muted hover:border-accent hover:text-accent"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScancopyRecord(r);
                                  }}
                                >
                                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                                  <span>{hasScancopySync(r.refNo) ? "Scancopy" : "+ PDF"}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[1420px] text-left text-xs border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: "52px" }} />
                    <col style={{ width: "145px" }} />
                    <col style={{ width: "290px" }} />
                    <col style={{ width: "140px" }} />
                    <col style={{ width: "auto" }} />
                    <col style={{ width: "160px" }} />
                    <col style={{ width: "185px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "170px" }} />
                  </colgroup>
                  <thead className="sticky top-0 z-10 border-b-2 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                    <tr>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        NO
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Register
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Reference Number
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        ACC Reference
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Title / Work Description
                      </th>
                      <th className="p-2.5 font-bold whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Location / Block
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#c6e0b4] dark:bg-emerald-950/90 border-r border-slate-300 dark:border-slate-700">
                        Status ACC
                      </th>
                      <th className="p-2.5 font-bold text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90 border-r border-slate-300 dark:border-slate-700">
                        Inspection / Date
                      </th>
                      <th className="p-2.5 font-bold uppercase text-center whitespace-nowrap bg-[#b4c6e7] dark:bg-sky-950/90">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300/80 dark:divide-slate-700/70">
                    {filteredRegisters.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-muted">
                          No records match the selected filter. Try changing category, status, or search term.
                        </td>
                      </tr>
                    ) : (
                      filteredRegisters.slice(0, 500).map((r, i) => {
                        const late = isOverdue(r, today);
                        const displayDate = r.dueDate || r.recordDate;
                        return (
                          <tr
                            key={r.id}
                            onClick={() => openEditRecord(r)}
                            className="hover:brightness-95 transition cursor-pointer"
                          >
                            <td className="p-2 text-center font-medium text-ink bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="p-2 font-semibold text-accent bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                              <span className="truncate block" title={r.subcategory}>
                                {r.subcategory}
                              </span>
                            </td>
                            <td className="p-2 font-bold font-mono text-slate-900 dark:text-sky-100 bg-[#d9e1f2]/65 dark:bg-sky-950/30 border-r border-slate-300/70 dark:border-slate-700/70 whitespace-nowrap tracking-tight">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{r.refNo}</span>
                                {hasScancopySync(r.refNo) ? (
                                  <button
                                    type="button"
                                    title="View closed signed scancopy PDF"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScancopyRecord(r);
                                    }}
                                    className="inline-flex items-center gap-1 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold hover:bg-rose-500 hover:text-white transition shadow-2xs cursor-pointer"
                                  >
                                    <FileCheck2 className="h-3 w-3" />
                                    <span>Scancopy</span>
                                  </button>
                                ) : r.state === "closed" || (r.status || "").toLowerCase().includes("closed") ? (
                                  <button
                                    type="button"
                                    title="Upload closed signed scancopy PDF"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScancopyRecord(r);
                                    }}
                                    className="inline-flex items-center gap-1 rounded border border-dashed border-rose-400/50 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 text-[10px] font-medium hover:bg-rose-500/10 transition cursor-pointer"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                    <span>Scancopy</span>
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="p-2 text-center font-mono text-[11px] font-semibold text-slate-800 dark:text-sky-200 bg-[#d9e1f2]/65 dark:bg-sky-950/30 border-r border-slate-300/70 dark:border-slate-700/70 whitespace-nowrap">
                              {r.accRef || "—"}
                            </td>
                            <td className="p-2 font-medium text-ink bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-w-[320px]">
                              <span className="line-clamp-2" title={r.title}>
                                {r.title}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 max-w-[160px] truncate" title={r.location || ""}>
                              <span className="truncate block" title={r.location}>
                                {r.location || "—"}
                              </span>
                            </td>
                            <td className="p-2 text-center bg-[#e2efda]/70 dark:bg-emerald-950/25 border-r border-slate-300/70 dark:border-slate-700/70 whitespace-nowrap">
                              <span
                                className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusPillClass(
                                  r.status,
                                  r.state,
                                )}`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="p-2 text-center bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                              <span className={late ? "font-bold text-red-600 dark:text-red-400" : "font-medium text-ink"}>
                                {formatDate(displayDate)}
                              </span>
                              {late && (
                                <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                                  Overdue ({daysOverdue(r.dueDate, today)}d)
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center bg-white dark:bg-slate-900 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  title="Edit record details and live preview official form"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent hover:border-accent hover:bg-accent hover:text-white transition shadow-2xs cursor-pointer whitespace-nowrap"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditRecord(r);
                                  }}
                                >
                                  <FileEdit className="h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  title={hasScancopySync(r.refNo) ? "Preview signed scancopy PDF" : "Attach signed scancopy PDF"}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                                    hasScancopySync(r.refNo)
                                      ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white shadow-2xs"
                                      : "border-line bg-paper/60 text-muted hover:border-accent hover:text-accent"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScancopyRecord(r);
                                  }}
                                >
                                  <FileText className="h-3.5 w-3.5 text-rose-500" />
                                  <span>{hasScancopySync(r.refNo) ? "Scancopy" : "+ PDF"}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
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

      {/* Closed Scancopy PDF Viewer & Upload Modal */}
      <ScancopyViewerModal
        open={Boolean(scancopyRecord)}
        onClose={() => setScancopyRecord(null)}
        refNo={scancopyRecord?.refNo || ""}
        recordId={scancopyRecord?.id || ""}
        title={scancopyRecord?.title || ""}
        category={scancopyRecord?.category || ""}
        subcategory={scancopyRecord?.subcategory || ""}
        status={scancopyRecord?.status || "Closed"}
        userName={currentUser.name}
        onScancopyChanged={() => setScancopyVersion((v) => v + 1)}
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
