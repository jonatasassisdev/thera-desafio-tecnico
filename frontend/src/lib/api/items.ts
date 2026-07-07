import { apiClient } from "./client";
import type { Item } from "@/lib/types";

export interface ItemInput {
  sku: string;
  name: string;
  description?: string;
}

export const itemsApi = {
  list: async (): Promise<Item[]> => (await apiClient.get("/items")).data,
  get: async (id: string): Promise<Item> => (await apiClient.get(`/items/${id}`)).data,
  create: async (input: ItemInput): Promise<Item> => (await apiClient.post("/items", input)).data,
  update: async (id: string, input: Partial<ItemInput>): Promise<Item> =>
    (await apiClient.patch(`/items/${id}`, input)).data,
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
};
