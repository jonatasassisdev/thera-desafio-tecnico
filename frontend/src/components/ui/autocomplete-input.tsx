"use client";

import { useId, useRef, useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import clsx from "clsx";
import { normalizeText } from "@/lib/normalize-text";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  onBlur?: () => void;
  name?: string;
  className?: string;
  /** Shows a "Cadastrar novo" row at the bottom of the dropdown for fields backed by a cadastro screen. */
  onCreateNew?: () => void;
  createLabel?: string;
}

/**
 * Searchable combobox for fields backed by a growable registry (customers, transport types, items, ...),
 * where a plain <select> would not scale once the list has many records.
 */
export function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = "Buscar...",
  disabled,
  emptyMessage = "Nenhum resultado encontrado.",
  onBlur,
  name,
  className,
  onCreateNew,
  createLabel = "Cadastrar novo",
}: AutocompleteInputProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const displayValue = open ? query : (selectedOption?.label ?? "");

  const filteredOptions = open
    ? options.filter((option) => normalizeText(option.label).includes(normalizeText(query)))
    : options;

  function openWithQuery(nextQuery: string) {
    setOpen(true);
    setQuery(nextQuery);
    setHighlightedIndex(0);
  }

  function close() {
    setOpen(false);
    setQuery(selectedOption?.label ?? "");
  }

  function selectOption(option: AutocompleteOption) {
    onChange(option.value);
    setOpen(false);
    setQuery(option.label);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      openWithQuery(selectedOption?.label ?? "");
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      close();
    }
  }

  return (
    <div className={clsx("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onFocus={(e) => {
            openWithQuery(selectedOption?.label ?? "");
            e.target.select();
          }}
          onChange={(e) => openWithQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            close();
            onBlur?.();
          }}
          className="w-full rounded-sm border border-line bg-inset px-3 py-2 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
        <ChevronsUpDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-line bg-surface py-1 shadow-lg shadow-black/10"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-text-muted">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={clsx(
                  "flex cursor-pointer flex-col gap-0.5 px-3 py-2 text-sm transition-colors",
                  index === highlightedIndex ? "bg-accent-wash text-accent" : "text-text-primary hover:bg-raised",
                )}
              >
                <span>{option.label}</span>
                {option.description && <span className="text-xs text-text-muted">{option.description}</span>}
              </li>
            ))
          )}
          {onCreateNew && (
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onCreateNew();
              }}
              className="flex cursor-pointer items-center gap-1.5 border-t border-line-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-wash"
            >
              <Plus size={14} strokeWidth={2.25} />
              {createLabel}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
