import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { qaqcAudit, qaqcRecords } from "@/db/schema";
import workbookSnapshot from "@/lib/workbook-snapshot.json";

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
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "This request is not allowed." }, { status: 403 });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in before saving a record." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[A-Za-z0-9_-]{1,96}$/.test(id)) return Response.json({ error: "Record not found." }, { status: 404 });

  const payload = await request.json().catch(() => null);
  const parsed = updateInput.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Check the required fields and try again." }, { status: 400 });

  const db = getDb();
  try {
    const existing = await db.select().from(qaqcRecords).where(eq(qaqcRecords.id, id)).limit(1);
    const snapshot = workbookSnapshot.records.find((row) => row.id === id);
    if (!existing.length && !snapshot) return Response.json({ error: "Record not found." }, { status: 404 });

    const previous = existing[0] ?? snapshot;
    const now = new Date().toISOString();
    const input = parsed.data;
    const record = {
      id,
      category: input.category,
      subcategory: input.subcategory,
      sourceSheet: existing[0]?.sourceSheet ?? snapshot?.sourceSheet ?? "Dashboard entry",
      sourceRow: existing[0]?.sourceRow ?? snapshot?.sourceRow ?? null,
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
      createdBy: existing[0]?.createdBy ?? user.userId,
      updatedBy: user.userId,
      createdAt: existing[0]?.createdAt ?? now,
      updatedAt: now,
    };
    const [saved] = await db.insert(qaqcRecords).values(record).onConflictDoUpdate({ target: qaqcRecords.id, set: record }).returning();
    await db.insert(qaqcAudit).values({ id: randomUUID(), recordId: id, action: "updated", actorId: user.userId, beforeJson: JSON.stringify(previous), afterJson: JSON.stringify(saved), createdAt: now });
    return Response.json({ record: saved }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The shared record store is not ready yet. Try again after setup." }, { status: 503 });
  }
}
