export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        {eyebrow && (
          <span className="mono-tabular text-xs font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
