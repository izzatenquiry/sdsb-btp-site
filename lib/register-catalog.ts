export type RegisterCategory = "Submission" | "Inspection" | "Test" | "NCR & Observation";

export type RegisterDefinition = {
  name: string;
  category: RegisterCategory;
  sourceSheets?: string[];
};

export const registerCatalog: RegisterDefinition[] = [
  { name: "RFWI A C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK A C&S"] },
  { name: "RFWI B C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK B"] },
  { name: "RFWI C C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK C"] },
  { name: "RFWI F C&S", category: "Inspection", sourceSheets: ["RFWI BLOCK F"] },
  { name: "RFWI A ARC", category: "Inspection", sourceSheets: ["RFWI BLOCK A ARCH"] },
  { name: "RFWI B ARC", category: "Inspection", sourceSheets: ["RFWI BLOCK B ARCH"] },
  { name: "MOS - REVISION only", category: "Submission", sourceSheets: ["MOS EW", "MOS MBWA M&E", "MOS MBWA"] },
  { name: "ITP", category: "Inspection", sourceSheets: ["ITP"] },
  { name: "CHECKLIST", category: "Inspection", sourceSheets: ["Checklist"] },
  { name: "CUBE TEST EW", category: "Test", sourceSheets: ["Cube Test (EW)"] },
  { name: "CUBE TEST BLOCK A", category: "Test", sourceSheets: ["Cube Test (BLOCK A)"] },
  { name: "CUBE TEST BLOCK B", category: "Test", sourceSheets: ["Cube Test (BLOCK B)"] },
  { name: "GROUT TEST BLOCK A", category: "Test" },
  { name: "GROUT TEST BLOCK B", category: "Test" },
  { name: "RSS SUMMARY", category: "NCR & Observation", sourceSheets: ["RSS Reply"] },
  { name: "SSR SUMMARY", category: "NCR & Observation", sourceSheets: ["RSS Reply"] },
  { name: "FDT TEST", category: "Test", sourceSheets: ["FDT Test"] },
  { name: "PILE TEST DATE", category: "Test", sourceSheets: ["Pile Record ACC"] },
  { name: "PLATE LOAD BEARING TEST", category: "Test", sourceSheets: ["PlateLoadBearing"] },
  { name: "LAB SUMMARY", category: "Test", sourceSheets: ["LAB"] },
  { name: "OJT", category: "Inspection", sourceSheets: ["OJT"] },
  // FOK is treated as First-of-Kind inspection tracking; no source rows were present.
  { name: "FOK LIST", category: "Inspection" },
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
};

const revisedMosAccRefs = new Set(["BTP-A_Sbmtl_005", "BTP-A_Sbmtl_0040"]);

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

  for (const record of records) {
    const sourceSheet = record.sourceSheet.trim();
    if (sourceSheet.startsWith("MOS") && revisedMosAccRefs.has(String(record.accRef ?? "").trim())) {
      result.push(withRegister(record, "MOS - REVISION only"));
      continue;
    }

    const definition = sourceSheet.startsWith("MOS")
      ? undefined
      : registerCatalog.find((register) => register.sourceSheets?.includes(sourceSheet)
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
  const register = registerByName.get(subcategory.trim());
  return Boolean(register && register.category === category);
}
