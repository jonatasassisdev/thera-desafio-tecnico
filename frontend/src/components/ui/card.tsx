import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-sm border border-line bg-surface", className)}>{children}</div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
