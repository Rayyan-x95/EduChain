import apiClient from "./client";
import type { Credential } from "../types/api";

export async function getCredentials() {
  const { data } = await apiClient.get<Credential[]>("/credentials/me");
  return data;
}

export async function issueCredential(payload: {
  student_id: string;
  category: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const { data } = await apiClient.post<Credential>("/credentials", payload);
  return data;
}

export async function revokeCredential(id: string, reason: string) {
  const { data } = await apiClient.post(`/credentials/${id}/revoke`, { reason });
  return data;
}

export async function verifyCredential(credential_id: string, payload_hash: string, signature: string) {
  const { data } = await apiClient.post("/credentials/verify", {
    credential_id,
    payload_hash,
    signature,
  });
  return data;
}
