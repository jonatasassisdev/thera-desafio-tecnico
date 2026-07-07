"use client";

import { CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toastDismissed } from "@/store/slices/toasts-slice";

const TONE_STYLES: Record<string, string> = {
  success: "border-l-[var(--status-delivered)] text-[var(--status-delivered)]",
  error: "border-l-[var(--danger)] text-[var(--danger)]",
  info: "border-l-[var(--status-planned)] text-[var(--status-planned)]",
};

const TONE_ICONS: Record<string, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastViewport() {
  const toasts = useAppSelector((state) => state.toasts.items);
  const dispatch = useAppDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = TONE_ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className={`animate-toast-in flex items-start gap-3 rounded-sm border border-line border-l-2 bg-raised px-4 py-3 text-sm shadow-lg shadow-black/40 ${TONE_STYLES[toast.tone]}`}
          >
            <Icon size={17} strokeWidth={2} className="mt-0.5 shrink-0" />
            <span className="flex-1 text-text-primary">{toast.message}</span>
            <button
              onClick={() => dispatch(toastDismissed(toast.id))}
              className="shrink-0 text-text-muted transition hover:text-text-primary"
              aria-label="Fechar"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
