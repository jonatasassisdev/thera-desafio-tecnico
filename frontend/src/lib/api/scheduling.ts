import { apiClient } from "./client";
import type { Paginated, Scheduling, SchedulingStatus, SchedulingWithOrder } from "@/lib/types";

export interface SchedulingInput {
  deliveryDate: string;
  windowStart: string;
  windowEnd: string;
}

export interface SchedulingFilters {
  status?: SchedulingStatus | "";
  page?: number;
  pageSize?: number;
}

function cleanParams(filters: SchedulingFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""));
}

export const schedulingApi = {
  list: async (filters: SchedulingFilters = {}): Promise<Paginated<SchedulingWithOrder>> =>
    (await apiClient.get("/scheduling", { params: cleanParams(filters) })).data,
  getForOrder: async (salesOrderId: string): Promise<Scheduling | null> =>
    (await apiClient.get(`/sales-orders/${salesOrderId}/scheduling`)).data,
  define: async (salesOrderId: string, input: SchedulingInput): Promise<Scheduling> =>
    (await apiClient.put(`/sales-orders/${salesOrderId}/scheduling`, input)).data,
  confirm: async (salesOrderId: string): Promise<Scheduling> =>
    (await apiClient.post(`/sales-orders/${salesOrderId}/scheduling/confirm`)).data,
  reschedule: async (salesOrderId: string, input: SchedulingInput): Promise<Scheduling> =>
    (await apiClient.post(`/sales-orders/${salesOrderId}/scheduling/reschedule`, input)).data,
};
