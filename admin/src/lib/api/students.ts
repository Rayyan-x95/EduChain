import apiClient from "./client";
import type { StudentProfile } from "../types/api";

export async function getStudents(params?: Record<string, string>) {
  const { data } = await apiClient.get<StudentProfile[]>("/students", { params });
  return data;
}

export async function getStudent(id: string) {
  const { data } = await apiClient.get<StudentProfile>(`/students/${id}`);
  return data;
}

export async function updateStudentStatus(id: string, status: string, reason?: string) {
  const { data } = await apiClient.patch(`/students/${id}/status`, { status, reason });
  return data;
}
