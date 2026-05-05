import { ApiResponse } from "@/types/api.types";
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
const axiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
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
    const response = await axiosInstance().get<ApiResponse<TData>>(
      endpoint,
      options,
    );
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
    const response = await axiosInstance().post<ApiResponse<TData>>(
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
    const response = await axiosInstance().put<ApiResponse<TData>>(
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
    const response = await axiosInstance().delete<ApiResponse<TData>>(
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
    const response = await axiosInstance().patch<ApiResponse<TData>>(
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
