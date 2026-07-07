import { apiClient } from "./client";
import type { Customer } from "@/lib/types";

export interface CustomerInput {
  name: string;
  document: string;
  email?: string;
  authorizedTransportTypeIds: string[];
}

export const customersApi = {
  list: async (): Promise<Customer[]> => (await apiClient.get("/customers")).data,
  get: async (id: string): Promise<Customer> => (await apiClient.get(`/customers/${id}`)).data,
  create: async (input: CustomerInput): Promise<Customer> => (await apiClient.post("/customers", input)).data,
  update: async (id: string, input: Partial<CustomerInput>): Promise<Customer> =>
    (await apiClient.patch(`/customers/${id}`, input)).data,
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
