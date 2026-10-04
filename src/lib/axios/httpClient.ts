import { ApiResponse } from "@/types/api.types";
import axios from "axios";
import { cookies } from "next/headers";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
// Token refresh happens in proxy.ts, which runs before every page render and
// server action, so the cookies read here are already fresh.
const axiosInstance = async () => {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  // eg. "accessToken=token; refreshToken=token; better-auth.session_token=token"

  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
  return instance;
};
// Logs method, path and status only. The axios error object also holds the request
// headers (session cookies), so it must never be logged as a whole.
const logApiError = (method: string, endpoint: string, error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  // 4xx are expected (validation, auth) and shown to the user; log only real failures
  if (!status || status >= 500) {
    console.error(`[api] ${method} ${endpoint.split("?")[0]} failed${status ? ` (${status})` : ""}`);
  }
};

export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  // request body for DELETE requests
  data?: unknown;
}
const httpGet = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.get<ApiResponse<TData>>(endpoint, options);
    return response.data;
  } catch (error) {
    logApiError("GET", endpoint, error);
    throw error;
  }
};
const httpPost = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.post<ApiResponse<TData>>(
      endpoint,
      data,
      options,
    );
    return response.data;
  } catch (error) {
    logApiError("POST", endpoint, error);
    throw error;
  }
};
const httpPut = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.put<ApiResponse<TData>>(
      endpoint,
      data,
      options,
    );
    return response.data;
  } catch (error) {
    logApiError("PUT", endpoint, error);
    throw error;
  }
};
const httpDelete = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.delete<ApiResponse<TData>>(
      endpoint,
      options,
    );
    return response.data;
  } catch (error) {
    logApiError("DELETE", endpoint, error);
    throw error;
  }
};
const httpPatch = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
  try {
    const instance = await axiosInstance();
    const response = await instance.patch<ApiResponse<TData>>(
      endpoint,
      data,
      options,
    );
    return response.data;
  } catch (error) {
    logApiError("PATCH", endpoint, error);
    throw error;
  }
};

export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  delete: httpDelete,
  patch: httpPatch,
};
