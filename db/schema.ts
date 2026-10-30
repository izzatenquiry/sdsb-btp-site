import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const qaqcRecords = sqliteTable(
  "qaqc_records",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull(),
    subcategory: text("subcategory").notNull().default("General"),
    sourceSheet: text("source_sheet").notNull().default("Dashboard entry"),
    sourceRow: integer("source_row"),
    refNo: text("ref_no").notNull(),
    accRef: text("acc_ref").notNull().default(""),
    title: text("title").notNull(),
    discipline: text("discipline").notNull().default(""),
    location: text("location").notNull().default(""),
    status: text("status").notNull(),
    state: text("state").notNull(),
    dueDate: text("due_date"),
    recordDate: text("record_date"),
    notes: text("notes").notNull().default(""),
    origin: text("origin").notNull().default("dashboard-entry"),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("qaqc_records_category_state_idx").on(table.category, table.state),
    index("qaqc_records_due_date_idx").on(table.dueDate),
  ],
);

export const qaqcAudit = sqliteTable(
  "qaqc_audit",
  {
    id: text("id").primaryKey(),
    recordId: text("record_id").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id").notNull(),
    beforeJson: text("before_json"),
    afterJson: text("after_json").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("qaqc_audit_record_created_idx").on(table.recordId, table.createdAt)],
);
