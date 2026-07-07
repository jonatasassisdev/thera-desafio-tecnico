import { forwardRef } from "react";
import clsx from "clsx";

interface FieldWrapperProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export function FieldWrapper({ label, error, hint, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wider text-text-secondary">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-text-muted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

const baseInputClasses =
  "w-full rounded-sm border border-line bg-inset px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={clsx(baseInputClasses, className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={clsx(baseInputClasses, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={clsx(baseInputClasses, "min-h-20", className)} {...props} />;
  },
);
