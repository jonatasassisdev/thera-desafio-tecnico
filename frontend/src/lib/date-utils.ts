const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return "";
  return date.toLocaleDateString("pt-BR");
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getMonthLabel(viewDate: Date): string {
  const label = viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS;
}

/** Returns a fixed 42-cell (6-week) grid of dates covering the given month, padded with adjacent months' days. */
export function getCalendarGrid(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1 - startOffset);

  return Array.from(
    { length: 42 },
    (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
  );
}
