import type { SalesOrderStatus } from "@/lib/types";

export const SALES_ORDER_TRANSITIONS: Record<SalesOrderStatus, SalesOrderStatus[]> = {
  CREATED: ["PLANNED"],
  PLANNED: ["SCHEDULED"],
  SCHEDULED: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
};

export const TRANSPORT_CHANGEABLE_STATUSES: SalesOrderStatus[] = ["CREATED", "PLANNED"];
