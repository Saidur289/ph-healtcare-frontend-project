export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  success: boolean;
  meta?: PaginationMeta;
}
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ApiErrorResponse {
  message: string;
  success: boolean;
}
