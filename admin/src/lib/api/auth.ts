import apiClient from "./client";
import type { LoginResponse } from "../types/api";

export async function login(email: string, password: string, institution_slug: string) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
    institution_slug,
  });
  return data;
}

export async function refreshToken(refresh_token: string) {
  const { data } = await apiClient.post("/auth/refresh", { refresh_token });
  return data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}
