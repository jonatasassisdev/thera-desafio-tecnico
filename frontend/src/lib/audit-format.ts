import { SALES_ORDER_STATUS_LABELS, SCHEDULING_STATUS_LABELS } from "@/lib/status-labels";
import type { AuditLogEntry, SalesOrderStatus, SchedulingStatus } from "@/lib/types";

type AuditState = Record<string, unknown> | null;

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function nestedName(value: unknown): string | undefined {
  if (value && typeof value === "object" && "name" in value) {
    return asString((value as { name: unknown }).name);
  }
  return undefined;
}

function formatOrderState(state: AuditState): string {
  if (!state) return "—";
  const status = asString(state.status);
  return status ? (SALES_ORDER_STATUS_LABELS[status as SalesOrderStatus] ?? status) : "—";
}

function formatTransportState(state: AuditState): string {
  if (!state) return "—";
  return nestedName(state.transportType) ?? asString(state.transportTypeId) ?? "—";
}

function formatSchedulingState(state: AuditState): string {
  if (!state) return "—";
  const parts: string[] = [];
  const deliveryDate = asString(state.deliveryDate);
  if (deliveryDate) parts.push(new Date(deliveryDate).toLocaleDateString("pt-BR"));

  const windowStart = asString(state.windowStart);
  const windowEnd = asString(state.windowEnd);
  if (windowStart && windowEnd) parts.push(`${windowStart}–${windowEnd}`);

  const status = asString(state.status);
  if (status) parts.push(SCHEDULING_STATUS_LABELS[status as SchedulingStatus] ?? status);

  return parts.length ? parts.join(" · ") : "—";
}

function formatCreationState(state: AuditState): string {
  if (!state) return "—";
  const parts: string[] = [];

  const customerName = nestedName(state.customer);
  if (customerName) parts.push(`Cliente: ${customerName}`);

  const transportName = nestedName(state.transportType);
  if (transportName) parts.push(`Transporte: ${transportName}`);

  const status = asString(state.status);
  if (status) parts.push(`Status: ${SALES_ORDER_STATUS_LABELS[status as SalesOrderStatus] ?? status}`);

  return parts.length ? parts.join(" · ") : "—";
}

export interface FormattedAuditEntry {
  before: string | null;
  after: string;
}

export function formatAuditEntry(entry: AuditLogEntry): FormattedAuditEntry {
  switch (entry.action) {
    case "SALES_ORDER_CREATED":
      return { before: null, after: formatCreationState(entry.newState) };
    case "STATUS_CHANGED":
      return { before: formatOrderState(entry.previousState), after: formatOrderState(entry.newState) };
    case "TRANSPORT_CHANGED":
      return { before: formatTransportState(entry.previousState), after: formatTransportState(entry.newState) };
    case "SCHEDULING_CHANGED":
      return {
        before: entry.previousState ? formatSchedulingState(entry.previousState) : null,
        after: formatSchedulingState(entry.newState),
      };
    default:
      return { before: null, after: "—" };
  }
}
