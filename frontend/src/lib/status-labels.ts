import type { SalesOrderStatus, SchedulingStatus } from "@/lib/types";
import type { ChipTone } from "@/components/ui/chip";

export const SALES_ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  CREATED: "Criada",
  PLANNED: "Planejada",
  SCHEDULED: "Agendada",
  IN_TRANSIT: "Em transporte",
  DELIVERED: "Entregue",
};

export const SALES_ORDER_STATUS_TONES: Record<SalesOrderStatus, ChipTone> = {
  CREATED: "disabled",
  PLANNED: "info",
  SCHEDULED: "warning",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
};

export const SCHEDULING_STATUS_LABELS: Record<SchedulingStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  RESCHEDULED: "Reagendado",
};

export const SCHEDULING_STATUS_TONES: Record<SchedulingStatus, ChipTone> = {
  PENDING: "warning",
  CONFIRMED: "success",
  RESCHEDULED: "info",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  SALES_ORDER_CREATED: "Ordem de Venda criada",
  STATUS_CHANGED: "Status alterado",
  SCHEDULING_CHANGED: "Agendamento alterado",
  TRANSPORT_CHANGED: "Transporte alterado",
};
