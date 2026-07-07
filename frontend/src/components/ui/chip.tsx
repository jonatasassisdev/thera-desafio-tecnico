import clsx from "clsx";

export type ChipTone = "success" | "error" | "warning" | "disabled" | "info" | "primary";

interface ChipProps {
  tone: ChipTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<ChipTone, string> = {
  success: "bg-[var(--tone-success)] border-[var(--tone-success)] text-white",
  error: "bg-[var(--tone-error)] border-[var(--tone-error)] text-white",
  warning: "bg-[var(--tone-warning)] border-[var(--tone-warning)] text-white",
  disabled: "bg-[var(--tone-disabled)] border-[var(--tone-disabled)] text-white",
  info: "bg-[var(--tone-info)] border-[var(--tone-info)] text-white",
  primary: "bg-accent border-accent text-white",
};

/** Exposes the Chip's tone classes for cases that need the same look on a non-<span> element (e.g. a clickable toggle). */
export function chipToneClassName(tone: ChipTone): string {
  return TONE_CLASSES[tone];
}

/** Standard status pill used across the app — always one of the six fixed tones, never a one-off color. */
export function Chip({ tone, children, className }: ChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
