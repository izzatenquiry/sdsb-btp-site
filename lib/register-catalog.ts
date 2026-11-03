import { STATIC_MOS_COMPARISON_ROWS, type MosComparisonRow } from "./mos-comparison-data";

export type RegisterCategory = "Submission" | "Inspection" | "Test" | "NCR & Observation";

export type RegisterDefinition = {
  name: string;
  category: RegisterCategory;
  sourceSheets?: string[];
};

export const registerCatalog: RegisterDefinition[] = [
  // 1. Box 1: Submissions, Quality Governance & Surveillance (7 registers)
  { name: "MOS Comparison", category: "Submission", sourceSheets: ["MOS Comparison", "MOS EW", "MOS MBWA M&E", "MOS MBWA"] },
  { name: "ITP", category: "Submission", sourceSheets: ["ITP"] },
  { name: "CHECKLIST", category: "Submission", sourceSheets: ["Checklist"] },
  { name: "OJT", category: "Submission", sourceSheets: ["OJT"] },
  { name: "FOK LIST", category: "Submission" },
  { name: "RSS SUMMARY", category: "Submission", sourceSheets: ["RSS Reply"] },
  { name: "SSR SUMMARY", category: "Submission", sourceSheets: ["RSS Reply"] },

  // 2. Box 2: Site Work Inspections - RFWI (6 registers)
  { name: "RFWI A C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK A C&S"] },
  { name: "RFWI B C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK B"] },
  { name: "RFWI C C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK C"] },
  { name: "RFWI F C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK F"] },
  { name: "RFWI A ARC", category: "Inspection", sourceSheets: ["RFWI BLOCK A ARCH"] },
  { name: "RFWI B ARC", category: "Inspection", sourceSheets: ["RFWI BLOCK B ARCH"] },

  // 3. Box 3: QAQC Testing Records (9 registers)
  { name: "CUBE TEST EW", category: "Test", sourceSheets: ["Cube Test (EW)"] },
  { name: "CUBE TEST BLOCK A", category: "Test", sourceSheets: ["Cube Test (BLOCK A)"] },
  { name: "CUBE TEST BLOCK B", category: "Test", sourceSheets: ["Cube Test (BLOCK B)"] },
  { name: "GROUT TEST BLOCK A", category: "Test" },
  { name: "GROUT TEST BLOCK B", category: "Test" },
  { name: "FDT TEST", category: "Test", sourceSheets: ["FDT Test"] },
  { name: "PILE TEST DATE", category: "Test", sourceSheets: ["Pile Record ACC"] },
  { name: "PLATE LOAD BEARING TEST", category: "Test", sourceSheets: ["PlateLoadBearing"] },
  { name: "LAB SUMMARY", category: "Test", sourceSheets: ["LAB"] },
];

export const registerByName = new Map(registerCatalog.map((register) => [register.name, register]));

export type SnapshotRecord = {
  id: string;
  category: RegisterCategory | string;
  subcategory?: string;
  sourceSheet: string;
  sourceRow?: number | null;
  refNo: string;
  accRef?: string;
  title: string;
  discipline?: string;
  location?: string;
  status: string;
  state: "open" | "closed" | "unknown";
  dueDate?: string | null;
  recordDate?: string | null;
  notes?: string;
  origin?: string;
  // MOS Comparison fields
  trade?: string;
  workItem?: string;
  accRefA?: string;
  descriptionA?: string;
  accRefB?: string;
  descriptionB?: string;
};

export function mapMosRowToSnapshotRecord(row: MosComparisonRow, origin = "google-sheets"): SnapshotRecord {
  const sourceRow = row.no + 5;
  const isPendingA = !row.accRefA || /pending/i.test(row.accRefA);
  const isPendingB = !row.accRefB || /pending/i.test(row.accRefB);
  const status = isPendingA || isPendingB ? "Pending Submission" : "Submitted";
  const trade = row.trade || "C&S";
  const discipline = trade.toUpperCase().includes("ARCH") ? "Architectural" : "Civil & Structural";
  const refParts = [row.accRefA, row.accRefB].filter((v) => v && !/pending/i.test(v));

  return {
    id: `gs-MOS Comparison-${sourceRow}`,
    category: "Submission",
    subcategory: "MOS Comparison",
    sourceSheet: "MOS Comparison",
    sourceRow,
    refNo: row.accRefA || row.accRefB || `MOS-${String(row.no).padStart(3, "0")}`,
    accRef: refParts.join(" / ") || row.accRefA || row.accRefB || "",
    title: row.workItem || row.descriptionA || row.descriptionB || `MOS Item #${row.no}`,
    discipline,
    location: "",
    status,
    state: "open",
    dueDate: null,
    recordDate: null,
    notes: [
      row.accRefA ? `ACC Ref A: ${row.accRefA} (${row.descriptionA || "-"})` : "",
      row.accRefB ? `Acc Ref B: ${row.accRefB} (${row.descriptionB || "-"})` : "",
    ]
      .filter(Boolean)
      .join(" | "),
    origin,
    trade: row.trade,
    workItem: row.workItem,
    accRefA: row.accRefA,
    descriptionA: row.descriptionA,
    accRefB: row.accRefB,
    descriptionB: row.descriptionB,
  };
}

function sourceArea(row?: number | null) {
  if (row && row >= 32) return "Block C";
  if (row && row >= 27) return "Block F";
  if (row && row >= 20) return "Block B";
  return "Block A / Earthwork";
}

function ssrReference(title: string) {
  return title.match(/Site Surveillance Reply\.\s*No\.:\s*(.+)$/i)?.[1]?.trim() ?? "";
}

function withRegister(record: SnapshotRecord, name: string, id = record.id, overrides: Partial<SnapshotRecord> = {}): SnapshotRecord {
  const definition = registerByName.get(name)!;
  return {
    ...record,
    ...overrides,
    id,
    category: definition.category,
    subcategory: name,
  };
}

export function buildRegisterSnapshot(records: SnapshotRecord[]) {
  const result: SnapshotRecord[] = [];

  for (const row of STATIC_MOS_COMPARISON_ROWS) {
    result.push(mapMosRowToSnapshotRecord(row, "workbook"));
  }

  for (const record of records) {
    const sourceSheet = record.sourceSheet.trim();
    if (sourceSheet.startsWith("MOS")) {
      continue;
    }

    const definition = registerCatalog.find((register) => register.sourceSheets?.includes(sourceSheet)
      && sourceSheet !== "RSS Reply");
    if (definition) result.push(withRegister(record, definition.name));
  }

  const rssSource = records.filter((record) => record.sourceSheet.trim() === "RSS Reply");
  for (const record of rssSource) {
    const replyRef = ssrReference(record.title);
    if (!replyRef) continue;

    const linkedRssRef = String(record.refNo ?? "").trim() !== replyRef;
    const area = sourceArea(record.sourceRow);
    result.push(withRegister(record, "SSR SUMMARY", record.id, {
      refNo: replyRef,
      accRef: linkedRssRef ? String(record.refNo ?? "").trim() : "",
      title: `Site Surveillance Reply · ${replyRef}`,
      location: area,
    }));

    if (linkedRssRef) {
      result.push(withRegister(record, "RSS SUMMARY", `rss-${record.id}`, {
        refNo: String(record.refNo ?? "").trim(),
        accRef: replyRef,
        title: `Linked SSR reply · ${replyRef}`,
        location: area,
      }));
    }
  }

  return result;
}

export function isAllowedRegisterRecord(category: string, subcategory: string) {
  const normalized = subcategory.trim() === "MOS - REVISION" ? "MOS Comparison" : subcategory.trim();
  const register = registerByName.get(normalized);
  return Boolean(register && register.category === category);
}
