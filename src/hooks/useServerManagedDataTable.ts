"use client";

import { PaginationState, SortingState } from "@tanstack/react-table";
import { ReadonlyURLSearchParams, usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";

interface UserServerManagedDataTableParams {
  searchParams: ReadonlyURLSearchParams;
  defaultPage?: number;
  defaultLimit?: number;
}
export interface UpdateParamsOptions {
  resetPage?: boolean;
}
export type UpdateParamsFn = (
  updater: (params: URLSearchParams) => void,
  options?: UpdateParamsOptions,
) => void;
const parsePositiveInteger = (
  value: string | null,
  fallbackValue: number,
): number => {
  if (!value) {
    return fallbackValue;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallbackValue;
  }
  return parsed;
};

export const useServerManagedDataTable = ({
  searchParams,
  defaultPage = 1,
  defaultLimit = 10,
}: UserServerManagedDataTableParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isRouteRefreshPending, startRouteRefreshTransition] = useTransition();
  const queryStringFromUrl = useMemo(
    () => searchParams.toString(),
    [searchParams],
  );
  const paginationStateFromUrl = useMemo(() => {
    const page = parsePositiveInteger(searchParams.get("page"), defaultPage);
    const limit = parsePositiveInteger(searchParams.get("limit"), defaultLimit);
    return { pageIndex: page - 1, pageSize: limit };
  }, [defaultLimit, defaultPage, searchParams]);
  const sortingStateFromUrl = useMemo<SortingState>(() => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    if (!sortBy || (sortOrder !== "asc" && sortOrder !== "desc")) return [];
    return [{ id: sortBy, desc: sortOrder === "desc" }];
  }, [searchParams]);
  const [optimisticSortingState, setOptimisticSortingState] =
    useState<SortingState>(sortingStateFromUrl);
  const [optimisticPaginationState, setOptimisticPaginationState] =
    useState<PaginationState>(paginationStateFromUrl);
  const updateUrlAndRefresh = useCallback(
    (params: URLSearchParams) => {
      const nextQuery = params.toString();
      const currentQuery = window.location.search.replace(/^\?/, "");
      if (nextQuery === currentQuery) {
        return;
      }
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      //update url immediately for optimistic UI then refresh server component
      window.history.pushState(null, "", nextUrl);
      startRouteRefreshTransition(() => {
        router.refresh();
      });
    },
    [pathname, router, startRouteRefreshTransition],
  );
  const updateParams = useCallback<UpdateParamsFn>(
    (
      updater: (params: URLSearchParams) => void,
      options?: UpdateParamsOptions,
    ) => {
      const params = new URLSearchParams(window.location.search);
      updater(params);
      if (options?.resetPage) {
        params.set("page", "1");
        setOptimisticPaginationState((prevStat) => ({
          pageIndex: 0,
          pageSize: prevStat.pageSize,
        }));
      }
      updateUrlAndRefresh(params);
    },
    [updateUrlAndRefresh],
  );
  const handleSortingChange = useCallback(
    (state: SortingState) => {
      setOptimisticSortingState(state);
      updateParams(
        (params) => {
          const nextSorting = state[0];
          if (nextSorting) {
            params.set("sortBy", nextSorting.id);
            params.set("sortOrder", nextSorting.desc ? "desc" : "asc");
            return;
          }
          params.delete("sortBy");
          params.delete("sortOrder");
        },
        {
          resetPage: true,
        },
      );
    },
    [updateParams],
  );
  const handlePaginationChange = useCallback(
    (state: PaginationState) => {
      setOptimisticPaginationState(state);
      updateParams((params) => {
        params.set("page", (state.pageIndex + 1).toString());
        params.set("limit", state.pageSize.toString());
      });
    },
    [updateParams],
  );
  return {
    queryStringFromUrl,
    optimisticPaginationState,
    optimisticSortingState,
    handlePaginationChange,
    handleSortingChange,
    updateParams,
    isRouteRefreshPending,
  };
};
