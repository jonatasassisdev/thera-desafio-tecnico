"use client";

import { useState } from "react";
import { Menu, Workflow } from "lucide-react";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            <Menu size={20} />
          </button>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-accent-wash text-accent">
            <Workflow size={14} strokeWidth={2} />
          </span>
          <span className="mono-tabular text-xs font-semibold uppercase tracking-[0.3em] text-accent">OVGS</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 md:px-10 md:py-8">
          <div className="mx-auto max-w-6xl animate-fade-rise">{children}</div>
        </main>
      </div>
    </div>
  );
}
