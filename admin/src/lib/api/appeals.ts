import apiClient from "./client";
import type { Appeal } from "../types/api";

export async function getPendingAppeals() {
  const { data } = await apiClient.get<Appeal[]>("/appeals/pending");
  return data;
}

export async function reviewAppeal(id: string, status: string, review_notes?: string) {
  const { data } = await apiClient.post(`/appeals/${id}/review`, { status, review_notes });
  return data;
}
