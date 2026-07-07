import { apiClient } from "./client";
import type { AuditLogEntry, Paginated, SalesOrder, SalesOrderStatus } from "@/lib/types";

export interface SalesOrderFilters {
  status?: SalesOrderStatus | "";
  customerId?: string;
  transportTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateSalesOrderInput {
  customerId: string;
  transportTypeId: string;
  items: { itemId: string; quantity: number }[];
}

function cleanParams(filters: SalesOrderFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""));
}

export const salesOrdersApi = {
  list: async (filters: SalesOrderFilters = {}): Promise<Paginated<SalesOrder>> =>
    (await apiClient.get("/sales-orders", { params: cleanParams(filters) })).data,
  get: async (id: string): Promise<SalesOrder> => (await apiClient.get(`/sales-orders/${id}`)).data,
  create: async (input: CreateSalesOrderInput): Promise<SalesOrder> =>
    (await apiClient.post("/sales-orders", input)).data,
  updateStatus: async (id: string, status: SalesOrderStatus): Promise<SalesOrder> =>
    (await apiClient.patch(`/sales-orders/${id}/status`, { status })).data,
  updateTransport: async (id: string, transportTypeId: string): Promise<SalesOrder> =>
    (await apiClient.patch(`/sales-orders/${id}/transport`, { transportTypeId })).data,
  auditTrail: async (id: string): Promise<AuditLogEntry[]> =>
    (await apiClient.get(`/audit-logs/SalesOrder/${id}`)).data,
};
