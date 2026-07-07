import axios from "axios";
import type { ApiError } from "@/lib/types";
import { translateApiMessage } from "./translate-error";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  headers: { "Content-Type": "application/json" },
});

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.map(translateApiMessage).join(" ");
    if (typeof message === "string") return translateApiMessage(message);
    return "Não foi possível se comunicar com o servidor.";
  }
  if (error instanceof Error) return error.message;
  return "Erro inesperado.";
}
