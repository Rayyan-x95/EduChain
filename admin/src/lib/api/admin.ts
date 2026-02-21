import apiClient from "./client";
import type { DashboardStats, AuditLog, SigningKey } from "../types/api";

export async function getDashboardStats() {
  const { data } = await apiClient.get<DashboardStats>("/admin/dashboard");
  return data;
}

export async function getAuditLogs(params?: Record<string, string>) {
  const { data } = await apiClient.get<AuditLog[]>("/admin/audit-logs", { params });
  return data;
}

export async function assignRole(user_id: string, role: string) {
  const { data } = await apiClient.post("/admin/roles", { user_id, role });
  return data;
}

export async function generateKey() {
  const { data } = await apiClient.post<SigningKey>("/admin/keys/generate");
  return data;
}

export async function rotateKey() {
  const { data } = await apiClient.post<SigningKey>("/admin/keys/rotate");
  return data;
}
