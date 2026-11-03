import {
  mapMosRowToSnapshotRecord,
  registerCatalog,
  type RegisterCategory,
  type SnapshotRecord,
} from "./register-catalog";
import { fetchLiveMosComparisonRows, STATIC_MOS_COMPARISON_ROWS } from "./mos-comparison-data";

export const GOOGLE_SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwETyhGkGhqkRZyePYL3TLVyPniZEXKqT-aOBK0-lY7WDXVGR0GXlQwF5BOtz3YNwl3jg/exec";

export const GOOGLE_SHEETS_SPREADSHEET_ID =
  "11Wfxz7mFVR2Gq1vuSsix_pQSVhQXgDl3Tk1B4eaKSFs";

export const GOOGLE_SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/11Wfxz7mFVR2Gq1vuSsix_pQSVhQXgDl3Tk1B4eaKSFs/edit";

export const GOOGLE_SHEETS_NAME = "Internal QAQC Live Tracking (Google Sheets)";

// In-memory cache for fast response times
let cachedRecords: SnapshotRecord[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

export function invalidateGoogleSheetsCache() {
  cachedRecords = null;
  lastFetchTime = 0;
}

function parseToIsoDate(val?: string | null): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Format DD/MM/YYYY or D/M/YYYY
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const d = slashMatch[1].padStart(2, "0");
    const m = slashMatch[2].padStart(2, "0");
    const y = slashMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Format DD-MMM-YYYY or other readable strings
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return s;
}

function normalizeSubcategory(sheetName: string): { canonicalName: string; category: RegisterCategory } {
  const clean = sheetName.trim();
  const lower = clean.toLowerCase().replace(/[-_]/g, " ");

  for (const reg of registerCatalog) {
    const regLower = reg.name.toLowerCase().replace(/[-_]/g, " ");
    if (regLower === lower) {
      return { canonicalName: reg.name, category: reg.category };
    }
  }

  // Handle special aliases
  if (lower.includes("mos")) return { canonicalName: "MOS Comparison", category: "Submission" };
  if (lower.includes("plate")) return { canonicalName: "PLATE LOAD BEARING TEST", category: "Test" };
  if (lower.includes("checklist")) return { canonicalName: "CHECKLIST", category: "Submission" };
  if (lower.includes("itp")) return { canonicalName: "ITP", category: "Submission" };
  if (lower.includes("ojt")) return { canonicalName: "OJT", category: "Submission" };
  if (lower.includes("fok")) return { canonicalName: "FOK LIST", category: "Submission" };
  if (lower.includes("rss")) return { canonicalName: "RSS SUMMARY", category: "Submission" };
  if (lower.includes("ssr")) return { canonicalName: "SSR SUMMARY", category: "Submission" };
  if (lower.includes("fdt")) return { canonicalName: "FDT TEST", category: "Test" };
  if (lower.includes("pile")) return { canonicalName: "PILE TEST DATE", category: "Test" };
  if (lower.includes("lab")) return { canonicalName: "LAB SUMMARY", category: "Test" };
  if (lower.includes("cube test ew")) return { canonicalName: "CUBE TEST EW", category: "Test" };
  if (lower.includes("cube test block a")) return { canonicalName: "CUBE TEST BLOCK A", category: "Test" };
  if (lower.includes("cube test block b")) return { canonicalName: "CUBE TEST BLOCK B", category: "Test" };
  if (lower.includes("grout test block a")) return { canonicalName: "GROUT TEST BLOCK A", category: "Test" };
  if (lower.includes("grout test block b")) return { canonicalName: "GROUT TEST BLOCK B", category: "Test" };

  return { canonicalName: clean, category: "Inspection" };
}

function deriveDiscipline(subcategory: string, title?: string): string {
  const upper = (subcategory + " " + (title || "")).toUpperCase();
  if (upper.includes("C&S") || upper.includes("CIVIL") || upper.includes("STRUCTURAL")) return "Civil & Structural";
  if (upper.includes("ARC") || upper.includes("ARCH") || upper.includes("ANTI TERMITE")) return "Architectural";
  if (upper.includes("M&E") || upper.includes("MEP")) return "M&E";
  if (upper.includes("CUBE") || upper.includes("TEST") || upper.includes("LAB") || upper.includes("SOIL")) return "QAQC Testing";
  return "General";
}

export function statusState(status: string): "open" | "closed" | "unknown" {
  const value = String(status || "").toLowerCase().trim();
  // Any status that is pending, in progress, awaiting, or rejected is OPEN
  if (/pending|await|progress|resubmi|reject|failed|delay|open|submitted|no response/.test(value)) {
    return "open";
  }
  // Pure closed, passed, completed, approved
  if (/closed|done|complete|approved|no objection|passed|responded/.test(value)) {
    return "closed";
  }
  return "unknown";
}

export async function fetchGoogleSheetRecords(forceRefresh = false): Promise<SnapshotRecord[]> {
  const now = Date.now();
  if (!forceRefresh && cachedRecords && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRecords;
  }

  try {
    const [res, liveMos] = await Promise.all([
      fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: "GET",
        headers: { "Accept": "application/json" },
        redirect: "follow",
        cache: "no-store",
      }),
      fetchLiveMosComparisonRows(GOOGLE_SHEETS_SPREADSHEET_ID),
    ]);

    if (!res.ok) {
      throw new Error(`Google Sheets WebApp returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.records)) {
      throw new Error(data.error || "Invalid response format from Google Sheets");
    }

    const mosRows = liveMos?.rows?.length ? liveMos.rows : STATIC_MOS_COMPARISON_ROWS;
    const mosRecords = mosRows.map((row) => mapMosRowToSnapshotRecord(row, "google-sheets"));

    const otherRecords: SnapshotRecord[] = [];
    for (const raw of data.records) {
      const sheetName = String(raw.sheetName || raw.subcategory || "").trim();
      const { canonicalName, category } = normalizeSubcategory(sheetName);
      if (canonicalName === "MOS Comparison") {
        // Replaced by full 7-column MOS Comparison records from live Google Sheet tab
        continue;
      }

      const title = String(raw.title || "").trim();
      const refNo = String(raw.refNo || "").trim();
      const status = String(raw.status || "Pending").trim();
      const location = String(raw.location || "").trim();
      const recordDate = parseToIsoDate(raw.recordDate);
      const accRef = raw.accRef ? String(raw.accRef).trim() : "";
      const sourceRow = typeof raw.sourceRow === "number" ? raw.sourceRow : null;

      otherRecords.push({
        id: raw.id || `gs-${sheetName}-${sourceRow || Math.random().toString(36).substring(2, 9)}`,
        category,
        subcategory: canonicalName,
        sourceSheet: sheetName,
        sourceRow,
        refNo: refNo || `REF-${sheetName}-${sourceRow || 1}`,
        accRef,
        title: title || refNo || `Record in ${canonicalName}`,
        discipline: deriveDiscipline(canonicalName, title),
        location,
        status,
        state: statusState(status),
        dueDate: null,
        recordDate,
        notes: raw.notes ? String(raw.notes) : "",
        origin: "google-sheets",
      });
    }

    const mappedRecords = [...mosRecords, ...otherRecords];
    cachedRecords = mappedRecords;
    lastFetchTime = now;
    return mappedRecords;
  } catch (err) {
    console.error("Failed to fetch records from Google Sheets:", err);
    if (cachedRecords) return cachedRecords;
    throw err;
  }
}

export async function addRecordToGoogleSheet(record: {
  category: RegisterCategory;
  subcategory: string;
  refNo: string;
  accRef?: string;
  title: string;
  discipline?: string;
  location?: string;
  status: string;
  recordDate?: string | null;
  dueDate?: string | null;
  notes?: string;
}) {
  invalidateGoogleSheetsCache();

  const payload = {
    action: "create",
    sheetName: record.subcategory,
    subcategory: record.subcategory,
    refNo: record.refNo,
    accRef: record.accRef || "",
    title: record.title,
    location: record.location || "",
    status: record.status || "Pending",
    recordDate: record.recordDate || new Date().toISOString().split("T")[0],
    dueDate: record.dueDate || "",
    notes: record.notes || "",
  };

  const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Google Sheets WebApp POST failed with status ${res.status}`);
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to append record in Google Sheets");
  }

  return result;
}

export async function updateRecordInGoogleSheet(record: {
  sourceRow?: number | null;
  sourceSheet?: string;
  subcategory: string;
  refNo: string;
  accRef?: string;
  title: string;
  location?: string;
  status: string;
  recordDate?: string | null;
  notes?: string;
}) {
  invalidateGoogleSheetsCache();

  const payload = {
    action: "update",
    sourceRow: record.sourceRow,
    sheetName: record.sourceSheet || record.subcategory,
    subcategory: record.subcategory,
    refNo: record.refNo,
    accRef: record.accRef || "",
    title: record.title,
    location: record.location || "",
    status: record.status,
    recordDate: record.recordDate || "",
    notes: record.notes || "",
  };

  const res = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Google Sheets WebApp PATCH failed with status ${res.status}`);
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to update record in Google Sheets");
  }

  return result;
}
