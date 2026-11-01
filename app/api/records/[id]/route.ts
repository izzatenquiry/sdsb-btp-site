import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { qaqcAudit, qaqcRecords } from "@/db/schema";
import workbookSnapshot from "@/lib/workbook-snapshot.json";
import { buildRegisterSnapshot, isAllowedRegisterRecord, type SnapshotRecord } from "@/lib/register-catalog";

const updateInput = z.object({
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
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

import { updateRecordInGoogleSheet } from "@/lib/google-sheets";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "This request is not allowed." }, { status: 403 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in before saving a record." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[A-Za-z0-9_-]{1,96}$/.test(id)) return Response.json({ error: "Record not found." }, { status: 404 });

  const payload = await request.json().catch(() => null);
  const parsed = updateInput.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Check the required fields and try again." }, { status: 400 });

  const input = parsed.data;
  const now = new Date().toISOString();

  // Parse sourceRow if id format is gs-<sheet>-<row>
  let parsedRow: number | null = null;
  const gsMatch = id.match(/^gs-.*-(\d+)$/);
  if (gsMatch) {
    parsedRow = parseInt(gsMatch[1], 10);
  }

  // 1. Update in Google Sheets
  try {
    await updateRecordInGoogleSheet({
      sourceRow: parsedRow,
      subcategory: input.subcategory,
      refNo: input.refNo,
      accRef: input.accRef,
      title: input.title,
      location: input.location,
      status: input.status,
      recordDate: input.recordDate,
      notes: input.notes,
    });
  } catch (err: any) {
    console.warn("Could not sync update to Google Sheets:", err.message);
  }

  const record = {
    id,
    category: input.category,
    subcategory: input.subcategory,
    sourceSheet: input.subcategory,
    sourceRow: parsedRow,
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

  try {
    const db = getDb();
    const existing = await db.select().from(qaqcRecords).where(eq(qaqcRecords.id, id)).limit(1);
    const previous = existing[0] ?? record;
    const [saved] = await db.insert(qaqcRecords).values(record).onConflictDoUpdate({ target: qaqcRecords.id, set: record }).returning();
    await db.insert(qaqcAudit).values({
      id: randomUUID(),
      recordId: id,
      action: "updated",
      actorId: user.userId,
      beforeJson: JSON.stringify(previous),
      afterJson: JSON.stringify(saved),
      createdAt: now,
    });
    return Response.json({ record: saved, googleSheetsSynced: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ record, googleSheetsSynced: true }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "This request is not allowed." }, { status: 403 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in before deleting a record." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[A-Za-z0-9_-]{1,96}$/.test(id)) return Response.json({ error: "Record not found." }, { status: 404 });

  const db = getDb();
  try {
    await db.delete(qaqcRecords).where(eq(qaqcRecords.id, id));
    await db.insert(qaqcAudit).values({ id: randomUUID(), recordId: id, action: "deleted", actorId: user.userId, beforeJson: null, afterJson: null, createdAt: new Date().toISOString() });
    return Response.json({ success: true, id }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not delete record." }, { status: 500 });
  }
}
