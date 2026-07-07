import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icon size={22} strokeWidth={1.5} className="mb-1 text-text-muted" />
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-muted">{description}</p>}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}
