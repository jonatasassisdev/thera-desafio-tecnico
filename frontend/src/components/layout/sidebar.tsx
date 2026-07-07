"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Workflow } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          "sidebar-scope fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] -translate-x-full flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 md:shrink-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-6">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent-wash text-accent">
            <Workflow size={18} strokeWidth={2} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="mono-tabular text-xs font-semibold uppercase tracking-[0.3em] text-accent">OVGS</span>
            <span className="text-sm text-text-secondary">Gestão de Ordens de Venda</span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-accent-wash text-accent" : "text-text-secondary hover:bg-raised hover:text-text-primary",
                )}
              >
                <Icon size={17} strokeWidth={2} className="shrink-0" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.label}</span>
                  <span className={clsx("text-[11px]", active ? "text-accent/70" : "text-text-muted")}>{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] text-text-muted">
            Desafio técnico Full Stack — Sistema de Gestão de Ordens de Venda (OVGS)
          </p>
        </div>
      </aside>
    </>
  );
}
