import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(path: string): Promise<T> {
  if (IS_MOCK) {
    throw new Error("Mock mode: use useQuery hooks instead of direct apiGet");
  }
  const res = await http.get<T>(path);
  return res.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await http.post<T>(path, body);
  return res.data;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await http.put<T>(path, body);
  return res.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await http.delete<T>(path);
  return res.data;
}
