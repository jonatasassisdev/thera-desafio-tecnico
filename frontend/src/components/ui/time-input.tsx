"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Clock } from "lucide-react";
import clsx from "clsx";
import { generateTimeSlots } from "@/lib/time-utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  onBlur?: () => void;
  stepMinutes?: number;
}

/** Custom-styled time picker ("HH:mm") — a dropdown of fixed-step slots, no native browser time picker UI. */
export function TimeInput({
  value,
  onChange,
  placeholder = "Selecionar horário",
  disabled,
  className,
  name,
  onBlur,
  stepMinutes = 30,
}: TimeInputProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const slots = generateTimeSlots(stepMinutes);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.children[highlightedIndex];
    if (item instanceof HTMLElement) item.scrollIntoView({ block: "nearest" });
  }, [open, highlightedIndex]);

  function openMenu() {
    if (disabled) return;
    setHighlightedIndex(Math.max(slots.indexOf(value), 0));
    setOpen(true);
  }

  function selectValue(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, slots.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const slot = slots[highlightedIndex];
      if (slot) selectValue(slot);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={clsx("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        name={name}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openMenu())}
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
        <span className="truncate">{value || placeholder}</span>
        <Clock size={14} className="shrink-0 text-text-muted" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-line bg-surface py-1 shadow-lg shadow-black/10"
        >
          {slots.map((slot, index) => (
            <li
              key={slot}
              role="option"
              aria-selected={slot === value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectValue(slot);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={clsx(
                "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                slot === value
                  ? "bg-accent-wash text-accent"
                  : index === highlightedIndex
                    ? "bg-raised text-text-primary"
                    : "text-text-primary",
              )}
            >
              <span>{slot}</span>
              {slot === value && <Check size={14} className="shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
