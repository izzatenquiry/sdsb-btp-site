import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { qaqcAudit, qaqcRecords } from "@/db/schema";
import workbookSnapshot from "@/lib/workbook-snapshot.json";

const recordInput = z.object({
  id: z.string().min(1).max(96).optional(),
  category: z.enum(["Submission", "Inspection", "Test", "NCR & Observation"]),
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
});

function statusState(status: string): "open" | "closed" | "unknown" {
  const value = status.toLowerCase();
  if (/closed|done|complete|approved|no objection|passed|responded/.test(value)) return "closed";
  if (/pending|progress|await|no response|resubmission|rejected|delay|open|submitted|failed/.test(value)) return "open";
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

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return errorResponse(401, "Sign in to view this dashboard.");

  let saved: Array<Record<string, unknown>> = [];
  let storageAvailable = true;
  try {
    saved = await getDb().select().from(qaqcRecords).limit(10000);
  } catch {
    storageAvailable = false;
  }

  const overrides = new Map(saved.map((row) => [String(row.id), row]));
  const snapshotRows = workbookSnapshot.records.map((record) => ({ ...record, ...(overrides.get(record.id) ?? {}) }));
  const snapshotIds = new Set(workbookSnapshot.records.map((record) => record.id));
  const newRows = saved.filter((row) => !snapshotIds.has(String(row.id)));
  return Response.json(
    {
      project: workbookSnapshot.project,
      sourceFile: workbookSnapshot.sourceFile,
      snapshotAsOf: workbookSnapshot.snapshotAsOf,
      accConnected: false,
      note: workbookSnapshot.note,
      dataQualityIssues: workbookSnapshot.dataQualityIssues,
      sheets: workbookSnapshot.sheets,
      storageAvailable,
      records: [...snapshotRows, ...newRows],
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
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
  const id = input.id && /^[A-Za-z0-9_-]{1,96}$/.test(input.id) ? input.id : `form-${randomUUID()}`;
  const value = {
    id,
    category: input.category,
    sourceSheet: input.sourceSheet,
    sourceRow: null,
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
    origin: id.startsWith("wb-") ? "workbook-edit" : "dashboard-entry",
    createdBy: user.userId,
    updatedBy: user.userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const existing = await getDb().select().from(qaqcRecords).where(eq(qaqcRecords.id, id)).limit(1);
    if (existing.length) return Response.json({ record: existing[0], duplicate: true }, { headers: { "Cache-Control": "no-store" } });
    const [record] = await getDb().insert(qaqcRecords).values(value).returning();
    await getDb().insert(qaqcAudit).values({ id: randomUUID(), recordId: id, action: "created", actorId: user.userId, beforeJson: null, afterJson: JSON.stringify(record), createdAt: now });
    return Response.json({ record }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return errorResponse(503, "The shared record store is not ready yet. Try again after the dashboard finishes setup.");
  }
}
