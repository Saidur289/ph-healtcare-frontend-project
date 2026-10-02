"use client";
import DataTable from "@/components/shared/table/DataTable";
import { DataTableFilterConfig, DataTableFilterValues } from "@/components/shared/table/DataTableFilters";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
  ServerManagedFilterDefinition,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { ApiResponse } from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { ReactNode, useMemo } from "react";

interface AdminListTableProps<T> {
  // first part of the TanStack key; mutations invalidate it (e.g. ["admin-patients"])
  queryKey: string;
  fetcher: (queryString: string) => Promise<ApiResponse<T[]>>;
  initialQueryString: string;
  columns: ColumnDef<T>[];
  searchPlaceholder: string;
  emptyMessage: string;
  filterDefinitions?: ServerManagedFilterDefinition[];
  filterConfigs?: DataTableFilterConfig[];
  rowActions?: (row: T) => ReactNode;
  toolbarAction?: ReactNode;
}

// One server-driven table for the admin pages: search, filters, sorting and pages
// live in the URL and are applied by the API (QueryBuilder).
const AdminListTable = <T,>({
  queryKey,
  fetcher,
  initialQueryString,
  columns,
  searchPlaceholder,
  emptyMessage,
  filterDefinitions = [],
  filterConfigs = [],
  rowActions,
  toolbarAction,
}: AdminListTableProps<T>) => {
  const searchParams = useSearchParams();
  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({ searchParams, defaultPage: 1, defaultLimit: 10 });
  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } = useServerManagedDataTableSearch({ searchParams, updateParams });
  const { filterValues, handleFilterChange, clearAllFilters } = useServerManagedDataTableFilters({
    searchParams,
    definitions: filterDefinitions,
    updateParams,
  });

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: () => fetcher(queryString),
  });

  const values = useMemo<DataTableFilterValues>(
    () => Object.fromEntries(filterConfigs.map((config) => [config.id, filterValues[config.id]])),
    [filterConfigs, filterValues],
  );

  if (isError) {
    return (
      <div role="alert" className="rounded-xl border border-dashed bg-card p-8 text-center text-[13px] text-muted-foreground">
        Could not load this list.{" "}
        <button type="button" className="font-medium text-primary hover:underline" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      isLoading={isLoading || isFetching || isRouteRefreshPending}
      emptyMessage={emptyMessage}
      sorting={{ state: optimisticSortingState, onSortingChange: handleSortingChange }}
      pagination={{ state: optimisticPaginationState, onPaginationChange: handlePaginationChange }}
      search={{
        initialValue: searchTermFromUrl,
        placeholder: searchPlaceholder,
        debounceMs: 600,
        onDebounceChange: handleDebouncedSearchChange,
      }}
      filters={
        filterConfigs.length
          ? { configs: filterConfigs, values, onFilterChange: handleFilterChange, onClearAll: clearAllFilters }
          : undefined
      }
      meta={data?.meta}
      rowActions={rowActions}
      toolbarAction={toolbarAction}
    />
  );
};

export default AdminListTable;
