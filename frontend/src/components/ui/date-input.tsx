"use client";

import { useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  formatDisplayDate,
  getCalendarGrid,
  getMonthLabel,
  getWeekdayLabels,
  isSameDay,
  parseISODate,
  toISODate,
} from "@/lib/date-utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  onBlur?: () => void;
}

/** Custom-styled date picker (ISO "yyyy-MM-dd" in/out, pt-BR display) — no native browser date picker UI. */
export function DateInput({ value, onChange, placeholder = "Selecionar data", disabled, className, name, onBlur }: DateInputProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedDate = parseISODate(value);
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate ?? today);

  function openCalendar() {
    if (disabled) return;
    setViewDate(selectedDate ?? today);
    setOpen(true);
  }

  function selectDay(day: Date) {
    onChange(toISODate(day));
    setOpen(false);
    triggerRef.current?.focus();
  }

  function clear() {
    onChange("");
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openCalendar();
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const days = getCalendarGrid(viewDate);

  return (
    <div className={clsx("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        name={name}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setOpen(false);
          onBlur?.();
        }}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-sm border border-line bg-inset px-3 py-2 text-left text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60",
          value ? "text-text-primary" : "text-text-muted",
        )}
      >
        <span className="truncate">{value ? formatDisplayDate(value) : placeholder}</span>
        <Calendar size={14} className="shrink-0 text-text-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-sm border border-line bg-surface p-3 shadow-lg shadow-black/10">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
              }}
              className="rounded-sm p-1 text-text-secondary transition-colors hover:bg-raised hover:text-text-primary"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-text-primary">{getMonthLabel(viewDate)}</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
              }}
              className="rounded-sm p-1 text-text-secondary transition-colors hover:bg-raised hover:text-text-primary"
              aria-label="Próximo mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {getWeekdayLabels().map((label, index) => (
              <span key={index} className="flex h-7 items-center justify-center text-[11px] font-medium text-text-muted">
                {label}
              </span>
            ))}
            {days.map((day) => {
              const outsideMonth = day.getMonth() !== viewDate.getMonth();
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectDay(day);
                  }}
                  className={clsx(
                    "flex h-8 items-center justify-center rounded-sm text-xs transition-colors",
                    selected
                      ? "bg-accent text-white font-medium"
                      : outsideMonth
                        ? "text-text-muted hover:bg-raised"
                        : "text-text-primary hover:bg-raised",
                    !selected && isToday && "ring-1 ring-inset ring-accent",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectDay(today);
              }}
              className="text-xs font-medium text-accent hover:underline"
            >
              Hoje
            </button>
            {value && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  clear();
                }}
                className="text-xs font-medium text-text-muted hover:text-text-primary"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
