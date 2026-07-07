import { forwardRef } from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: LucideIcon;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong disabled:bg-accent/50",
  secondary: "bg-raised text-text-primary border border-line hover:border-text-muted",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-raised",
  danger: "bg-transparent border border-danger/50 text-danger hover:bg-danger-wash",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", loading, icon: Icon, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={15} strokeWidth={2.25} className="shrink-0" />
      )}
      {children}
    </button>
  );
});
