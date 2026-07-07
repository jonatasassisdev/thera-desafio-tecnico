import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
      <span className="text-xs text-text-muted">
        Página {page} de {totalPages} · {total} {total === 1 ? "registro" : "registros"}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="secondary"
          icon={ChevronRight}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
