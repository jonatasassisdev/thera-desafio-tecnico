import { apiClient } from "./client";
import type { TransportType } from "@/lib/types";

export interface TransportTypeInput {
  name: string;
  description?: string;
}

export const transportTypesApi = {
  list: async (): Promise<TransportType[]> => (await apiClient.get("/transport-types")).data,
  get: async (id: string): Promise<TransportType> => (await apiClient.get(`/transport-types/${id}`)).data,
  create: async (input: TransportTypeInput): Promise<TransportType> =>
    (await apiClient.post("/transport-types", input)).data,
  update: async (id: string, input: Partial<TransportTypeInput> & { active?: boolean }): Promise<TransportType> =>
    (await apiClient.patch(`/transport-types/${id}`, input)).data,
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/transport-types/${id}`);
  },
};
