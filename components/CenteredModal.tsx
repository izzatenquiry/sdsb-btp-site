"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Standard unified modal footprint for all SDSB Main Modals */
export const STANDARD_MODAL_PANEL_CLASS =
  "relative z-10 flex h-[min(94vh,54rem)] w-full max-w-[84rem] flex-col overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-2xl shadow-ink/30 max-sm:h-[min(98vh,100%)]";

/** Shared shell — same footprint as modals. */
export const MODAL_SHELL_CLASS = STANDARD_MODAL_PANEL_CLASS;

/** Full-screen modals on mobile. */
export const FULL_MODAL_SHELL_CLASS = STANDARD_MODAL_PANEL_CLASS;

/** Wider shell for table preview / editor. */
export const WIDE_MODAL_SHELL_CLASS = STANDARD_MODAL_PANEL_CLASS;

/** Compact confirm / bucket dialogs. */
export const COMPACT_MODAL_PANEL_CLASS =
  "relative z-10 flex w-full max-w-lg max-h-[min(90vh,100%)] flex-col overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-2xl shadow-ink/20";

/** Medium forms (e.g. record entry & update). */
export const MEDIUM_MODAL_PANEL_CLASS = STANDARD_MODAL_PANEL_CLASS;

export const MODAL_OVERLAY_CLASS =
  "fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4";

export const MODAL_ACCENT_CLASS = "h-1 w-full shrink-0 bg-accent";

export const MODAL_HEADER_CLASS =
  "flex shrink-0 items-start justify-between gap-2 border-b border-line bg-paper/50 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4";

export const MODAL_TITLE_CLASS =
  "display text-lg font-semibold uppercase tracking-tight text-ink sm:text-xl";

export const MODAL_SUBTITLE_CLASS = "mt-0.5 text-[11px] text-muted sm:text-xs";

export const MODAL_CLOSE_CLASS =
  "shrink-0 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-paper hover:text-ink transition";

export const MODAL_FORM_CLASS = "flex min-h-0 flex-1 flex-col overflow-hidden";

export const MODAL_BODY_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-5";

export const MODAL_FOOTER_CLASS =
  "shrink-0 border-t border-line bg-paper/50 px-3 py-2 sm:px-6 sm:py-2.5 flex items-center justify-end gap-2";

export const MODAL_BTN_CANCEL_CLASS =
  "rounded-lg border border-line bg-paper-elevated px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper sm:px-4 cursor-pointer";

export const MODAL_BTN_PRIMARY_CLASS =
  "rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-accent/25 transition hover:brightness-110 disabled:opacity-60 sm:px-4 cursor-pointer";

export const MODAL_LABEL_CLASS = "block min-w-0 text-xs";

export const MODAL_LABEL_TEXT_CLASS = "font-medium text-ink-soft";

export const MODAL_FIELD_CLASS =
  "form-control form-control-sm mt-0.5 w-full rounded-lg border border-line bg-field px-2.5 py-1.5 text-ink outline-none focus:border-accent";

type Props = {
  open: boolean;
  onClose?: () => void;
  labelledBy?: string;
  panelClassName?: string;
  overlayClassName?: string;
  children: ReactNode;
};

export function CenteredModal({
  open,
  onClose,
  labelledBy,
  panelClassName = STANDARD_MODAL_PANEL_CLASS,
  overlayClassName = "",
  children,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className={`${MODAL_OVERLAY_CLASS} ${overlayClassName}`}>
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={panelClassName}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
