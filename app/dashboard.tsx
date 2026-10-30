"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, Bell, CalendarClock, Check,
  ChevronDown, CirclePlus, ClipboardList, CloudOff, FileCheck2, Filter,
  LayoutDashboard, LoaderCircle, Search, ShieldAlert, X,
} from "lucide-react";

type Category = "Submission" | "Inspection" | "Test" | "NCR & Observation";
type State = "open" | "closed" | "unknown";
type RecordRow = {
  id: string;
  category: Category;
  subcategory: string;
  sourceSheet: string;
  sourceRow?: number | null;
  refNo: string;
  accRef?: string;
  title: string;
  discipline?: string;
  location?: string;
  status: string;
  state: State;
  dueDate?: string | null;
  recordDate?: string | null;
  notes?: string;
  origin?: string;
};
type DashboardData = {
  project: string;
  sourceFile: string;
  snapshotAsOf: string;
  accConnected: boolean;
  note: string;
  dataQualityIssues: Array<{ sheet: string; cell?: string; field?: string; issue: string; effect: string }>;
  sheets: Array<{ name: string; category?: string; records: number; parsed: boolean; mode?: string; reason?: string }>;
  storageAvailable: boolean;
  records: RecordRow[];
};
type User = { name: string; email: string };
type FilterMode = "all" | "open" | "overdue" | "due-soon" | "closed";
type FormValue = {
  category: Category;
  subcategory: string;
  refNo: string;
  accRef: string;
  title: string;
  discipline: string;
  location: string;
  status: string;
  recordDate: string;
  dueDate: string;
  notes: string;
};

const categories: Category[] = ["Submission", "Inspection", "Test", "NCR & Observation"];
const labels: Record<Category, string> = {
  Submission: "Submissions & approvals",
  Inspection: "Inspections & work requests",
  Test: "QAQC test records",
  "NCR & Observation": "NCR & site observations",
};
const statusOptions: Record<Category, string[]> = {
  Submission: ["Awaiting Response", "Submitted", "No Objection", "No Objection with Comments", "Resubmission Required", "Rejected", "Closed"],
  Inspection: ["Pending GC", "Pending Consultant", "In Progress", "Open ACC Form", "Closed"],
  Test: ["Test record", "Scheduled", "Report Pending", "Passed", "Failed", "Completed"],
  "NCR & Observation": ["Open", "Corrective Action Submitted", "In Review", "Pending Response", "Closed"],
};

function localDate(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
function isOpen(row: RecordRow) { return row.state === "open"; }
function isOverdue(row: RecordRow, today: string) { return isOpen(row) && Boolean(row.dueDate) && row.dueDate! < today; }
function isDueSoon(row: RecordRow, today: string) {
  if (!isOpen(row) || !row.dueDate || row.dueDate < today) return false;
  const nextWeek = new Date(`${today}T00:00:00`);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return row.dueDate <= localDate(nextWeek);
}
function statusTone(status: string, state: State) {
  if (state === "closed") return "status-good";
  if (state === "open" && /rejected|failed|delay/i.test(status)) return "status-danger";
  if (state === "open") return "status-pending";
  return "status-muted";
}
function blankForm(): FormValue {
  return { category: "Submission", subcategory: "", refNo: "", accRef: "", title: "", discipline: "", location: "", status: "Awaiting Response", recordDate: "", dueDate: "", notes: "" };
}

export function Dashboard({ user }: { user: User }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [section, setSection] = useState<"Overview" | "Register">("Overview");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [form, setForm] = useState<FormValue>(blankForm());
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch("/api/records", { cache: "no-store" });
      const payload = await response.json() as { error?: string } & DashboardData;
      if (!response.ok) throw new Error(payload.error || "Could not load the registers.");
      setData(payload as DashboardData);
      setLoadError("");
      setLastUpdated(new Date());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load the registers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data load and interval subscription synchronize this view with the server API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const timer = window.setInterval(() => void refresh(true), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const rows = useMemo(() => data?.records ?? [], [data]);
  const subcategories = useMemo(() => (data?.sheets ?? [])
    .filter((sheet) => sheet.category && (categoryFilter === "All" || sheet.category === categoryFilter))
    .map((sheet) => sheet.name.trim())
    .filter(Boolean)
    .filter((name, index, names) => names.indexOf(name) === index)
    .sort((a, b) => a.localeCompare(b)), [data?.sheets, categoryFilter]);
  const today = localDate();
  const stats = useMemo(() => {
    const open = rows.filter(isOpen).length;
    const overdue = rows.filter((row) => isOverdue(row, today)).length;
    const dueSoon = rows.filter((row) => isDueSoon(row, today)).length;
    const closed = rows.filter((row) => row.state === "closed").length;
    const unknown = rows.filter((row) => row.state === "unknown").length;
    return { total: rows.length, open, overdue, dueSoon, closed, unknown };
  }, [rows, today]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (categoryFilter !== "All" && row.category !== categoryFilter) return false;
      if (filterMode === "open" && !isOpen(row)) return false;
      if (filterMode === "closed" && row.state !== "closed") return false;
      if (filterMode === "overdue" && !isOverdue(row, today)) return false;
      if (filterMode === "due-soon" && !isDueSoon(row, today)) return false;
      if (subcategoryFilter !== "All" && row.subcategory !== subcategoryFilter) return false;
      if (!term) return true;
      return [row.refNo, row.accRef, row.title, row.location, row.discipline, row.sourceSheet, row.subcategory, row.status]
        .some((value) => String(value ?? "").toLowerCase().includes(term));
    }).sort((a, b) => {
      const aDate = isOverdue(a, today) ? a.dueDate ?? "" : "9999-99-99";
      const bDate = isOverdue(b, today) ? b.dueDate ?? "" : "9999-99-99";
      return aDate.localeCompare(bDate) || a.refNo.localeCompare(b.refNo);
    });
  }, [rows, categoryFilter, subcategoryFilter, filterMode, query, today]);

  const categoryStats = useMemo(() => categories.map((category) => {
    const subset = rows.filter((row) => row.category === category);
    return { category, total: subset.length, open: subset.filter(isOpen).length, overdue: subset.filter((row) => isOverdue(row, today)).length };
  }), [rows, today]);

  function startNew() {
    setEditing(null);
    setForm(blankForm());
    setFormError("");
    setModalOpen(true);
  }
  function startEdit(row: RecordRow) {
    setEditing(row);
    setForm({ category: row.category, subcategory: row.subcategory || row.sourceSheet, refNo: row.refNo, accRef: row.accRef ?? "", title: row.title, discipline: row.discipline ?? "", location: row.location ?? "", status: row.status === "Not recorded" ? statusOptions[row.category][0] : row.status, recordDate: row.recordDate ?? "", dueDate: row.dueDate ?? "", notes: row.notes ?? "" });
    setFormError("");
    setModalOpen(true);
  }
  function openFilter(mode: FilterMode) {
    setSection("Register");
    setFilterMode(mode);
    setSubcategoryFilter("All");
  }
  function downloadCsv() {
    const columns = ["Category", "Subcategory", "Reference", "ACC Ref", "Title", "Trade", "Location", "Status", "Due date", "Source sheet"];
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [columns.map(quote).join(","), ...filteredRows.map((row) => [labels[row.category], row.subcategory, row.refNo, row.accRef, row.title, row.discipline, row.location, row.status, row.dueDate, row.sourceSheet].map(quote).join(","))];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BTP-QAQC-register-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!form.refNo.trim() || !form.title.trim()) { setFormError("Reference and title are required."); return; }
    if (!data?.storageAvailable) { setFormError("Shared storage is not ready. Your changes were not saved."); return; }
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null, recordDate: form.recordDate || null, sourceSheet: editing?.sourceSheet ?? "Dashboard entry" };
      const response = editing
        ? await fetch(`/api/records/${encodeURIComponent(editing.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id: `form-${crypto.randomUUID()}` }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The record could not be saved.");
      setModalOpen(false);
      setToast(editing ? "Record updated" : "Record added");
      window.setTimeout(() => setToast(""), 3200);
      await refresh(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The record could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const isOverview = section === "Overview";

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div><strong>BTP QAQC</strong><span>CONTROL CENTRE</span></div>
          <button className="icon-button nav-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="project-switcher"><span className="project-dot" /><div><small>PROJECT</small><strong>Banting Technology Park</strong></div><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={isOverview ? "nav-item active" : "nav-item"} onClick={() => { setSection("Overview"); setMobileNavOpen(false); }}><LayoutDashboard size={18} /><span>Overview</span></button>
          <button className={!isOverview ? "nav-item active" : "nav-item"} onClick={() => { setSection("Register"); setMobileNavOpen(false); }}><ClipboardList size={18} /><span>Registers</span><span className="nav-count">{rows.length.toLocaleString("en-MY")}</span></button>
          <button className="nav-item" onClick={startNew}><CirclePlus size={18} /><span>New entry</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-card">
            <div className="sync-title"><CloudOff size={16} /><span>ACC sync</span><span className="disconnected-pill">Off</span></div>
            <p>Workbook snapshot only. Entries here do not update ACC.</p>
          </div>
          <div className="user-block"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="user-copy"><strong>{user.name}</strong><span>{user.email}</span></div><span className="private-dot" title="Private site" /></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><span className="hamburger">☰</span></button>
          <div className="breadcrumb"><span>Quality Control</span><b>/</b><strong>{section}</strong></div>
          <div className="top-actions">
            <span className="snapshot-pill"><span className="pulse-dot" />Workbook snapshot · {formatDate(data?.snapshotAsOf)}</span>
            <button className="icon-button" onClick={() => void refresh()} aria-label="Refresh data" title="Refresh data"><Activity size={18} className={loading ? "spin-icon" : ""} /></button>
            <div className="top-avatar" title={user.email}>{user.name.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PROJECT QAQC</div>
              <h1>{isOverview ? "Quality control overview" : "QAQC registers"}</h1>
              <p>{isOverview ? "Track submissions, inspections, tests and site observations in one place." : "Search and maintain the workbook-derived register snapshot."}</p>
            </div>
            <div className="heading-actions">
              <button className="button-secondary" onClick={downloadCsv}><ArrowDownToLine size={16} />Export CSV</button>
              <button className="button-primary" onClick={startNew}><CirclePlus size={17} />Add record</button>
            </div>
          </div>

          {(data?.accConnected === false || data?.storageAvailable === false) && (
            <div className="notice-bar" role="status">
              <div className="notice-icon"><CloudOff size={18} /></div>
              <div><strong>{data?.storageAvailable === false ? "Shared storage is not ready" : "ACC is not connected"}</strong><p>{data?.storageAvailable === false ? "The snapshot is viewable, but new or edited entries cannot be saved yet." : "This dashboard shows a 30 Oct 2026 workbook snapshot. Form entries update this dashboard database only; they do not write back to ACC or the Excel file."}</p></div>
              <span className="notice-tag">{data?.storageAvailable === false ? "READ ONLY" : "SNAPSHOT"}</span>
            </div>
          )}

          {loadError && <div className="error-bar" role="alert"><AlertTriangle size={17} />{loadError}<button onClick={() => void refresh()} className="inline-action">Retry</button></div>}

          {loading && !data ? (
            <div className="loading-state"><LoaderCircle className="spin-icon" size={25} /><span>Loading QAQC registers…</span></div>
          ) : isOverview ? (
            <>
              <div className="kpi-grid">
                <Kpi label="REGISTER ROWS" value={stats.total.toLocaleString("en-MY")} detail="Across 54 workbook tabs" tone="blue" icon={<ClipboardList size={18} />} onClick={() => { setCategoryFilter("All"); openFilter("all"); }} />
                <Kpi label="OPEN / FOLLOW-UP" value={stats.open.toLocaleString("en-MY")} detail="Status recorded as open" tone="amber" icon={<Bell size={18} />} onClick={() => { setCategoryFilter("All"); openFilter("open"); }} />
                <Kpi label="DATED OVERDUE" value={stats.overdue.toLocaleString("en-MY")} detail="Open items past target date" tone="rose" icon={<ShieldAlert size={18} />} onClick={() => { setCategoryFilter("All"); openFilter("overdue"); }} />
                <Kpi label="DUE IN 7 DAYS" value={stats.dueSoon.toLocaleString("en-MY")} detail="Open items with a due date" tone="teal" icon={<CalendarClock size={18} />} onClick={() => { setCategoryFilter("All"); openFilter("due-soon"); }} />
              </div>

              <div className="overview-grid">
                <section className="panel category-panel">
                  <div className="panel-heading"><div><h2>Register workload</h2><p>Open and overdue items by main category</p></div><button className="text-button" onClick={() => { setCategoryFilter("All"); setSubcategoryFilter("All"); setFilterMode("all"); setSection("Register"); }}>View all <span>→</span></button></div>
                  <div className="category-list">{categoryStats.map((item) => <CategoryRow key={item.category} item={item} onClick={() => { setCategoryFilter(item.category); setSubcategoryFilter("All"); setFilterMode("all"); setSection("Register"); }} />)}</div>
                  <div className="legend-row"><span><i className="legend-open" />Open/follow-up</span><span><i className="legend-overdue" />Dated overdue</span></div>
                </section>
                <section className="panel follow-panel">
                  <div className="panel-heading"><div><h2>Action list</h2><p>Overdue items with a recorded status and target date</p></div><span className="count-badge badge-rose">{stats.overdue}</span></div>
                  <div className="action-list">
                    {rows.filter((row) => isOverdue(row, today)).sort((a,b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).slice(0,6).map((row) => <ActionRow key={row.id} row={row} onClick={() => startEdit(row)} />)}
                    {stats.overdue === 0 && <div className="empty-state"><Check size={23} /><strong>No dated overdue items</strong><span>Overdue status is calculated only where the source has a due date and an open status.</span></div>}
                  </div>
                  {stats.overdue > 6 && <button className="panel-footer" onClick={() => openFilter("overdue")}>Show all {stats.overdue} overdue items <span>→</span></button>}
                </section>
              </div>

              <div className="lower-grid">
                <section className="panel health-panel">
                  <div className="panel-heading"><div><h2>Data checks</h2><p>Known workbook issues that affect trust in the totals</p></div><span className="count-badge badge-amber">{data?.dataQualityIssues.length ?? 0}</span></div>
                  <div className="quality-list">{data?.dataQualityIssues.map((issue) => <div key={`${issue.sheet}-${issue.cell ?? issue.field}`} className="quality-row"><span className="quality-icon"><AlertTriangle size={15} /></span><div><strong>{issue.sheet}{issue.cell ? `!${issue.cell}` : ` · ${issue.field}`}</strong><span>{issue.issue} — {issue.effect}</span></div></div>)}</div>
                  <div className="quality-foot">{stats.unknown.toLocaleString("en-MY")} rows have no usable status in the source and are excluded from open/overdue counts.</div>
                </section>
                <section className="panel source-panel">
                  <div className="panel-heading"><div><h2>Source coverage</h2><p>Workbook tabs reviewed for the initial dashboard</p></div><span className="count-badge badge-blue">{data?.sheets.length ?? 0}/54</span></div>
                  <div className="coverage-stats"><div><strong>{rows.length.toLocaleString("en-MY")}</strong><span>rows indexed</span></div><div><strong>{data?.sheets.filter((sheet) => sheet.records > 0).length ?? 0}</strong><span>tabs with rows</span></div><div><strong>{stats.unknown.toLocaleString("en-MY")}</strong><span>status unclassified</span></div></div>
                  <p className="source-caption">Snapshot from <b>{data?.sourceFile}</b>. Last workbook revision: {formatDate(data?.snapshotAsOf)}. ACC synchronization is not connected.</p>
                </section>
              </div>
            </>
          ) : (
            <section className="panel register-panel">
              <div className="register-toolbar">
                <div className="register-title"><div><h2>All register rows</h2><p>{filteredRows.length.toLocaleString("en-MY")} shown · updates refresh every 30 seconds</p></div></div>
                <div className="register-controls">
                  <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reference, title, block…" /></label>
                  <label className="select-box"><Filter size={15} /><select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value as Category | "All"); setSubcategoryFilter("All"); }}><option value="All">All categories</option>{categories.map((category) => <option key={category} value={category}>{labels[category]}</option>)}</select></label>
                  <label className="select-box subcategory-filter"><select aria-label="Filter by subcategory" value={subcategoryFilter} onChange={(e) => setSubcategoryFilter(e.target.value)}><option value="All">All subcategories</option>{subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</select></label>
                  <label className="select-box status-filter"><select value={filterMode} onChange={(e) => setFilterMode(e.target.value as FilterMode)}><option value="all">All statuses</option><option value="open">Open/follow-up</option><option value="overdue">Dated overdue</option><option value="due-soon">Due in 7 days</option><option value="closed">Closed</option></select></label>
                </div>
              </div>
              <div className="table-wrap">
                <table><thead><tr><th>Category</th><th>Subcategory</th><th>Reference</th><th>Title / subject</th><th>Trade · location</th><th>Status</th><th>Target date</th></tr></thead>
                  <tbody>{filteredRows.slice(0, 500).map((row) => <tr key={row.id} onClick={() => startEdit(row)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") startEdit(row); }}><td><span className={`category-tag tag-${row.category === "Submission" ? "blue" : row.category === "Inspection" ? "teal" : row.category === "Test" ? "violet" : "orange"}`}>{shortCategory(row.category)}</span></td><td><span className="source-chip">{row.subcategory}</span></td><td><span className="reference-text">{row.refNo}</span>{row.accRef && <small className="acc-reference">ACC · {row.accRef}</small>}</td><td className="title-cell"><strong>{row.title}</strong></td><td><span>{[row.discipline, row.location].filter(Boolean).join(" · ") || "—"}</span></td><td><span className={`status-pill ${statusTone(row.status,row.state)}`}><i />{row.status}</span></td><td className={isOverdue(row,today) ? "date-overdue" : ""}>{formatDate(row.dueDate)}{isOverdue(row,today) && <small>Overdue</small>}</td></tr>)}</tbody>
                </table>
                {filteredRows.length === 0 && <div className="empty-state register-empty"><Search size={23} /><strong>No matching records</strong><span>Try a different filter or search phrase.</span></div>}
                {filteredRows.length > 500 && <div className="table-limit">Showing first 500 of {filteredRows.length.toLocaleString("en-MY")} rows. Use search and filters to narrow the list.</div>}
              </div>
              <div className="register-footer"><span><span className="pulse-dot" /> Refreshes every 30 seconds</span><span>Last refreshed {lastUpdated ? lastUpdated.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
            </section>
          )}
          <footer className="page-footer"><span>Private workspace · QAQC registers</span><span>Workbook snapshot only · ACC sync off</span></footer>
        </div>
      </section>

      {modalOpen && <RecordModal sheets={data?.sheets ?? []} form={form} setForm={setForm} editing={editing} saving={saving} error={formError} onClose={() => setModalOpen(false)} onSubmit={saveRecord} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </main>
  );
}

function Kpi({ label, value, detail, tone, icon, onClick }: { label: string; value: string; detail: string; tone: string; icon: React.ReactNode; onClick: () => void }) {
  return <button className={`kpi-card kpi-${tone}`} onClick={onClick}><span className="kpi-icon">{icon}</span><span className="kpi-copy"><small>{label}</small><strong>{value}</strong><span>{detail}</span></span></button>;
}
function CategoryRow({ item, onClick }: { item: { category: Category; total: number; open: number; overdue: number }; onClick: () => void }) {
  const percentage = item.total ? Math.max(3, Math.round(item.open / item.total * 100)) : 0;
  const overdueWidth = item.total ? Math.max(0, Math.round(item.overdue / item.total * 100)) : 0;
  return <button className="category-row" onClick={onClick}><span className={`category-symbol symbol-${item.category === "Submission" ? "blue" : item.category === "Inspection" ? "teal" : item.category === "Test" ? "violet" : "orange"}`}>{item.category === "Submission" ? <FileCheck2 size={17} /> : item.category === "Inspection" ? <ClipboardList size={17} /> : item.category === "Test" ? <Activity size={17} /> : <ShieldAlert size={17} />}</span><span className="category-info"><span className="category-name">{labels[item.category]}</span><span className="bar-track"><i style={{ width: `${percentage}%` }} /><b style={{ width: `${overdueWidth}%` }} /></span></span><span className="category-total"><strong>{item.total.toLocaleString("en-MY")}</strong><small>{item.open} open</small></span><span className="category-overdue">{item.overdue}</span></button>;
}
function ActionRow({ row, onClick }: { row: RecordRow; onClick: () => void }) {
  return <button className="action-row" onClick={onClick}><span className="action-mark"><AlertTriangle size={15} /></span><span className="action-main"><strong>{row.refNo}</strong><span>{row.title}</span><small>{shortCategory(row.category)} · {labels[row.category]}</small></span><span className="action-date"><b>{formatDate(row.dueDate)}</b><small>{daysLate(row.dueDate)}d late</small></span></button>;
}
function daysLate(value?: string | null) {
  if (!value) return 0;
  return Math.max(0, Math.floor((new Date(`${localDate()}T00:00:00`).getTime() - new Date(`${value}T00:00:00`).getTime()) / 86400000));
}
function shortCategory(category: Category) {
  return category === "NCR & Observation" ? "NCR / OBS" : category === "Inspection" ? "RFWI / MRI" : category === "Submission" ? "SUBMISSION" : "TEST";
}

function RecordModal({ sheets, form, setForm, editing, saving, error, onClose, onSubmit }: {
  sheets: DashboardData["sheets"];
  form: FormValue;
  setForm: React.Dispatch<React.SetStateAction<FormValue>>;
  editing: RecordRow | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const set = (key: keyof FormValue, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="record-modal-title"><div className="modal-accent" /><header className="modal-heading"><div><span className="eyebrow">QAQC REGISTER</span><h2 id="record-modal-title">{editing ? "Update register record" : "Add register record"}</h2><p>{editing ? `Source: ${editing.sourceSheet}${editing.sourceRow ? ` · row ${editing.sourceRow}` : ""}` : "Enter a record into the shared dashboard register."}</p></div><button className="icon-button" onClick={onClose} aria-label="Close form"><X size={19} /></button></header><form onSubmit={onSubmit} className="record-form">
    <div className="form-grid"><Field label="Record type" required><select value={form.category} onChange={(e) => { const category = e.target.value as Category; setForm((current) => ({ ...current, category, subcategory: "", status: statusOptions[category][0] })); }}>{categories.map((category) => <option key={category} value={category}>{labels[category]}</option>)}</select></Field><Field label="Subcategory / workbook tab" required><select value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)}><option value="">Select subcategory</option>{sheets.filter((sheet) => sheet.category === form.category).map((sheet) => <option key={sheet.name} value={sheet.name.trim()}>{sheet.name.trim()}</option>)}</select></Field>
    <Field label="Status" required><select value={form.status} onChange={(e) => set("status", e.target.value)}>{statusOptions[form.category].map((status) => <option key={status}>{status}</option>)}</select></Field>
    <Field label="Reference number" required><input value={form.refNo} onChange={(e) => set("refNo", e.target.value)} maxLength={160} placeholder="e.g. BTP-A-SDSB-RFI-001" autoFocus /></Field><Field label="ACC reference"><input value={form.accRef} onChange={(e) => set("accRef", e.target.value)} maxLength={160} placeholder="ACC ID / Submittal No." /></Field>
    <Field label="Title / subject" required wide><input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={600} placeholder="Describe the submission, inspection or issue" /></Field>
    <Field label="Trade / discipline"><input value={form.discipline} onChange={(e) => set("discipline", e.target.value)} maxLength={120} placeholder="C&S, M&E, Architecture…" /></Field><Field label="Block / location"><input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={200} placeholder="Block, level, zone or site area" /></Field>
    <Field label="Record date"><input type="date" value={form.recordDate} onChange={(e) => set("recordDate", e.target.value)} /></Field><Field label="Target / due date"><input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></Field>
    <Field label="Notes" wide><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={3000} rows={3} placeholder="Follow-up details or handover note" /></Field></div>
    <div className="form-disclaimer"><CloudOff size={15} /><span>Changes save to this dashboard only. They do not write back to ACC or the original Excel workbook.</span></div>
    {error && <div className="form-error" role="alert"><AlertTriangle size={16} />{error}</div>}
    <div className="modal-actions"><button type="button" className="button-secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="button-primary" disabled={saving}>{saving && <LoaderCircle size={16} className="spin-icon" />}{saving ? "Saving…" : editing ? "Save changes" : "Add record"}</button></div>
  </form></section></div>;
}
function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return <label className={`form-field ${wide ? "field-wide" : ""}`}><span>{label}{required && <i> *</i>}</span>{children}</label>;
}
