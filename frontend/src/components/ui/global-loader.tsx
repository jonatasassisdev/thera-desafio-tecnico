"use client";

import { useEffect, useRef, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Truck } from "lucide-react";

const MIN_VISIBLE_MS = 400;

/**
 * Global request indicator driven directly by React Query's fetch/mutation cache —
 * no manual wiring needed per screen, and it renders nothing (no DOM, no animation)
 * while idle, so there is zero cost when the app isn't talking to the API.
 *
 * Once shown, stays visible for at least MIN_VISIBLE_MS so fast requests don't just flash.
 */
export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const active = isFetching + isMutating > 0;

  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      shownAtRef.current = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: surface the indicator the instant a request starts
      setVisible(true);
      return;
    }

    const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : MIN_VISIBLE_MS;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    const timeoutId = setTimeout(() => setVisible(false), remaining);
    return () => clearTimeout(timeoutId);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/20"
    >
      <span className="sr-only">Carregando...</span>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-lg shadow-black/20">
        <span className="absolute inset-0 rounded-full border-2 border-line-soft" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-t-accent border-r-accent border-b-transparent border-l-transparent" />
        <Truck size={22} strokeWidth={2.25} className="text-accent" />
      </div>
    </div>
  );
}
