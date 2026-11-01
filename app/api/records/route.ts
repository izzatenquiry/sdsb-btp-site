import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { qaqcAudit, qaqcRecords } from "@/db/schema";
import workbookSnapshot from "@/lib/workbook-snapshot.json";
import { buildRegisterSnapshot, isAllowedRegisterRecord, registerCatalog, type SnapshotRecord } from "@/lib/register-catalog";

const recordInput = z.object({
  id: z.string().min(1).max(96).optional(),
  category: z.enum(["Submission", "Inspection", "Test", "NCR & Observation"]),
  subcategory: z.string().trim().min(1).max(120),
  refNo: z.string().trim().min(1).max(160),
  accRef: z.string().trim().max(160).optional().default(""),
  title: z.string().trim().min(1).max(600),
  discipline: z.string().trim().max(120).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  status: z.string().trim().min(1).max(100),
  dueDate: z.string().nullable().optional(),
  recordDate: z.string().nullable().optional(),
  notes: z.string().trim().max(3000).optional().default(""),
  sourceSheet: z.string().trim().max(120).optional().default("Dashboard entry"),
}).superRefine((input, context) => {
  if (!isAllowedRegisterRecord(input.category, input.subcategory)) {
    context.addIssue({ code: "custom", message: "Choose one of the 22 internal registers and its matching category." });
  }
});

function statusState(status: string): "open" | "closed" | "unknown" {
  const value = String(status || "").toLowerCase().trim();
  if (/pending|await|progress|resubmi|reject|failed|delay|open|submitted|no response/.test(value)) {
    return "open";
  }
  if (/closed|done|complete|approved|no objection|passed|responded/.test(value)) {
    return "closed";
  }
  return "unknown";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function errorResponse(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

import {
  fetchGoogleSheetRecords,
  addRecordToGoogleSheet,
  GOOGLE_SHEETS_NAME,
  GOOGLE_SHEETS_URL,
} from "@/lib/google-sheets";

export async function GET() {
  try {
    let records: SnapshotRecord[] = [];
    let isGoogleSheets = false;
    let syncError = "";

    try {
      // 1. Fetch live from Google Sheets
      records = await fetchGoogleSheetRecords();
      isGoogleSheets = true;
    } catch (err) {
      syncError = err instanceof Error ? err.message : String(err);
      console.warn("Falling back to local snapshot due to Google Sheets error:", err);
      
      const registerRows = buildRegisterSnapshot(workbookSnapshot.records as SnapshotRecord[]);
      records = registerRows;
    }

    const safeRecords = Array.isArray(records) ? records.filter(Boolean) : [];

    const registerSheets = registerCatalog.map((register) => ({
      name: register.name,
      category: register.category,
      records: safeRecords.filter((row) => String(row?.subcategory || "").trim().toLowerCase() === register.name.toLowerCase()).length,
      parsed: true,
    }));

    const selectedSourceSheets = new Set(registerCatalog.flatMap((register) => register.sourceSheets ?? []));
    const dataQualityIssues = (workbookSnapshot?.dataQualityIssues || []).filter((issue) => selectedSourceSheets.has(issue.sheet.trim()));

    return Response.json(
      {
        project: "SDSB · Banting Technology Park (BTP)",
        sourceFile: isGoogleSheets ? GOOGLE_SHEETS_NAME : workbookSnapshot.sourceFile,
        sourceUrl: GOOGLE_SHEETS_URL,
        googleSheetsConnected: isGoogleSheets,
        snapshotAsOf: new Date().toISOString().split("T")[0],
        accConnected: true,
        note: isGoogleSheets
          ? "Connected directly to Google Sheet 'Internal QAQC Live Tracking'. Live 2-way sync active."
          : `Fallback snapshot active. (${syncError || "Offline mode"})`,
        dataQualityIssues,
        sheets: registerSheets,
        storageAvailable: true,
        records: safeRecords,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (criticalErr) {
    console.error("Critical error in /api/records GET:", criticalErr);
    const registerRows = buildRegisterSnapshot(workbookSnapshot.records as SnapshotRecord[]);
    return Response.json(
      {
        project: "SDSB · Banting Technology Park (BTP)",
        sourceFile: workbookSnapshot.sourceFile,
        sourceUrl: GOOGLE_SHEETS_URL,
        googleSheetsConnected: false,
        snapshotAsOf: new Date().toISOString().split("T")[0],
        accConnected: true,
        note: "Fallback snapshot active",
        dataQualityIssues: [],
        sheets: [],
        storageAvailable: true,
        records: registerRows,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse(403, "This request is not allowed.");
  const user = await getChatGPTUser();
  if (!user) return errorResponse(401, "Sign in before saving a record.");

  const body = await request.json().catch(() => null);
  const parsed = recordInput.safeParse(body);
  if (!parsed.success) return errorResponse(400, "Check the required fields and try again.");

  const now = new Date().toISOString();
  const input = parsed.data;
  const id = input.id && /^[A-Za-z0-9_-]{1,96}$/.test(input.id) ? input.id : `gs-${input.subcategory}-${Date.now()}`;

  // 1. Send straight to Google Sheets
  let gsResult: any = null;
  try {
    gsResult = await addRecordToGoogleSheet({
      category: input.category,
      subcategory: input.subcategory,
      refNo: input.refNo,
      accRef: input.accRef,
      title: input.title,
      discipline: input.discipline,
      location: input.location,
      status: input.status,
      recordDate: input.recordDate,
      dueDate: input.dueDate,
      notes: input.notes,
    });
  } catch (err: any) {
    console.error("Error writing to Google Sheets:", err);
    return errorResponse(502, `Failed to update Google Sheet: ${err.message || "Network error"}`);
  }

  const value = {
    id,
    category: input.category,
    subcategory: input.subcategory,
    sourceSheet: input.subcategory,
    sourceRow: gsResult?.row || null,
    refNo: input.refNo,
    accRef: input.accRef,
    title: input.title,
    discipline: input.discipline,
    location: input.location,
    status: input.status,
    state: statusState(input.status),
    dueDate: input.dueDate ?? null,
    recordDate: input.recordDate ?? null,
    notes: input.notes,
    origin: "google-sheets",
    createdBy: user.userId,
    updatedBy: user.userId,
    createdAt: now,
    updatedAt: now,
  };

  // Optional: Also store in local database if available
  try {
    const db = getDb();
    const [record] = await db.insert(qaqcRecords).values(value).returning();
    await db.insert(qaqcAudit).values({
      id: randomUUID(),
      recordId: id,
      action: "created",
      actorId: user.userId,
      beforeJson: null,
      afterJson: JSON.stringify(record),
      createdAt: now,
    });
    return Response.json({ record, googleSheetsSynced: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    // If DB is offline, return the successfully created Google Sheets record
    return Response.json({ record: value, googleSheetsSynced: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  }
}

