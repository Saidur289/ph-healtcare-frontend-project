import { ApiResponse } from "@/types/api.types";
import axios from "axios";
import { isTokenExpiringSoon } from "../tokenUtils";
import { cookies, headers } from "next/headers";
import { getNewTokenWithRefreshToken } from "@/services/auth.service";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
async function tryRefreshToken(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  if (!isTokenExpiringSoon(accessToken)) return;
  const requestHeader = await headers();
  console.log("***********************", requestHeader);
  if (requestHeader.get("x-token-refresh") === "1") {
    return;
  }
  try {
    console.log("RefreshToken*********************************************");
    await getNewTokenWithRefreshToken(refreshToken);
  } catch (error) {
    console.log("error in try refresh token", error);
  }
}
const axiosInstance = async () => {
  const cookieStore = await cookies();
  console.log(
    "******************************* get cookies",
    cookieStore.getAll(),
  );
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (accessToken && refreshToken) {
    await tryRefreshToken(accessToken, refreshToken);
  }
  console.log(
    "Set cookies by axios",
    "********************************************",
  );
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  // eg. "accessToken=token; refreshToken=token; better-auth.session_token=token"
  console.log("before send it", cookieHeader);
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
export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
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
    console.log("Error fetching data");
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
    console.log("Error creating data");
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
    console.log("Error updating data");
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
    console.log("Error deleting data");
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
    console.log("Error patching data");
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
