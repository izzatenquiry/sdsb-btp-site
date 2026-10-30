CREATE TABLE `qaqc_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`before_json` text,
	`after_json` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `qaqc_audit_record_created_idx` ON `qaqc_audit` (`record_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `qaqc_records` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`source_sheet` text DEFAULT 'Dashboard entry' NOT NULL,
	`source_row` integer,
	`ref_no` text NOT NULL,
	`acc_ref` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`discipline` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`state` text NOT NULL,
	`due_date` text,
	`record_date` text,
	`notes` text DEFAULT '' NOT NULL,
	`origin` text DEFAULT 'dashboard-entry' NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `qaqc_records_category_state_idx` ON `qaqc_records` (`category`,`state`);--> statement-breakpoint
CREATE INDEX `qaqc_records_due_date_idx` ON `qaqc_records` (`due_date`);