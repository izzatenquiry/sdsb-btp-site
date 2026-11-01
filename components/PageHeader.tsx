import { ReactNode } from "react";

/** Standard page title + subtitle + actions matching KLC-GEMAS-DEPOT. */
export function PageHeader({
  title,
  description,
  actions,
  actionsFullWidth = false,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  actionsFullWidth?: boolean;
}) {
  return (
    <div
      className={`mb-5 flex flex-col gap-3 ${
        actionsFullWidth
          ? ""
          : "sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
      }`}
    >
      <div className="min-w-0">
        <h1 className="display text-2xl font-semibold uppercase tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 truncate text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div
          className={
            actionsFullWidth
              ? "flex w-full min-w-0 flex-col gap-2"
              : "flex w-full min-w-0 items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end"
          }
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** Panel / table shell — unified radius & border for all pages. */
export const panelClass =
  "shrink-0 overflow-hidden rounded-xl border border-line bg-paper-elevated";

/** Equal size for PageHeader action controls. */
export const toolbarSizeClass =
  "h-10 min-w-0 flex-1 basis-0 sm:w-[8.75rem] sm:flex-none sm:shrink-0";

/** Theme-aware form field (input / select / textarea). */
export const formControlClass =
  "form-control border border-line bg-field text-ink outline-none placeholder:text-muted focus:border-accent";

/** Equal-width select / input in PageHeader action rows. */
export const toolbarControlClass = `${toolbarSizeClass} ${formControlClass} rounded-lg px-2 text-sm font-semibold sm:px-2.5`;

const btnBase =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg px-2 text-sm font-semibold transition disabled:opacity-50 sm:px-3 cursor-pointer";

export const btnPrimaryClass = `${btnBase} bg-accent text-white shadow-sm shadow-accent/25 hover:brightness-110`;

export const btnDownloadClass = `${btnBase} bg-accent text-white shadow-sm shadow-accent/25 hover:brightness-110`;

export const btnSecondaryClass = `${btnBase} border border-line bg-field text-ink-soft hover:border-accent/40 hover:text-accent`;

export const btnToolbarPrimaryClass = `${btnPrimaryClass} ${toolbarSizeClass}`;
export const btnToolbarDownloadClass = `${btnDownloadClass} ${toolbarSizeClass}`;
export const btnToolbarSecondaryClass = `${btnSecondaryClass} ${toolbarSizeClass}`;
