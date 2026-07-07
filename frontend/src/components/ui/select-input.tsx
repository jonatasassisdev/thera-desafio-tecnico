"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

/** Custom-styled dropdown for small, fixed option lists (statuses, flags) — not backed by a growable registry. */
export function SelectInput({ value, onChange, options, placeholder, disabled, className, name }: SelectInputProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value) ?? null;

  function openMenu() {
    if (disabled) return;
    const currentIndex = options.findIndex((option) => option.value === value);
    setHighlightedIndex(Math.max(currentIndex, 0));
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
      setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) selectValue(option.value);
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
        onBlur={() => setOpen(false)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-sm border border-line bg-inset px-3 py-2 text-left text-sm transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60",
          selectedOption ? "text-text-primary" : "text-text-muted",
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown size={14} className={clsx("shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-line bg-surface py-1 shadow-lg shadow-black/10"
        >
          {placeholder !== undefined && (
            <li
              role="option"
              aria-selected={!value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectValue("");
              }}
              className={clsx(
                "flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                !value ? "bg-accent-wash text-accent" : "cursor-pointer text-text-muted hover:bg-raised",
              )}
            >
              <span className="truncate">{placeholder}</span>
              {!value && <Check size={14} className="shrink-0" />}
            </li>
          )}
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectValue(option.value);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={clsx(
                "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                option.value === value
                  ? "bg-accent-wash text-accent"
                  : index === highlightedIndex
                    ? "bg-raised text-text-primary"
                    : "text-text-primary",
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check size={14} className="shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
