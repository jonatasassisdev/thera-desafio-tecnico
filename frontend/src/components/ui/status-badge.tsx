import type { SalesOrderStatus, SchedulingStatus } from "@/lib/types";
import {
  SALES_ORDER_STATUS_LABELS,
  SALES_ORDER_STATUS_TONES,
  SCHEDULING_STATUS_LABELS,
  SCHEDULING_STATUS_TONES,
} from "@/lib/status-labels";
import { Chip } from "./chip";

export function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  return <Chip tone={SALES_ORDER_STATUS_TONES[status]}>{SALES_ORDER_STATUS_LABELS[status]}</Chip>;
}

export function SchedulingStatusBadge({ status }: { status: SchedulingStatus }) {
  return <Chip tone={SCHEDULING_STATUS_TONES[status]}>{SCHEDULING_STATUS_LABELS[status]}</Chip>;
}
