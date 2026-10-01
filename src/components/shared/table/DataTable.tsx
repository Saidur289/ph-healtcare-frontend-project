"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import DataTableFilters, {
  DataTableFilterConfig,
  DataTableFilterValue,
  DataTableFilterValues,
} from "./DataTableFilters";
import { PaginationMeta } from "@/types/api.types";
import { useEffect, useState } from "react";
import DataTableSearch from "./DataTableSearch";
import DataTablePagination from "./DataTablePagination";

interface DataTableActions<TData> {
  onView?: (data: TData) => void;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
}
interface DataTableProps<TData> {
  data: TData[];
  // card header from the design: "Upcoming Appointments" + "View All >"
  title?: string;
  viewAllHref?: string;
  // inline buttons shown before the ⋮ menu (e.g. "Check In", "Join Now")
  rowActions?: (data: TData) => React.ReactNode;
  columns: ColumnDef<TData>[];
  actions?: DataTableActions<TData>;
  toolbarAction?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  sorting?: {
    state: SortingState;
    onSortingChange: (state: SortingState) => void;
  };
  pagination?: {
    state: PaginationState;
    onPaginationChange: (state: PaginationState) => void;
  };
  search?: {
    initialValue?: string;
    placeholder?: string;
    debounceMs?: number;
    onDebounceChange: (value: string) => void;
  };
  filters?: {
    configs: DataTableFilterConfig[];
    values: DataTableFilterValues;
    onFilterChange: (
      filterId: string,
      value: DataTableFilterValue | undefined,
    ) => void;
    onClearAll?: () => void;
  };
  meta?: PaginationMeta;
}

const DataTable = <TData,>({
  data = [] as TData[],
  title,
  viewAllHref,
  rowActions,
  columns,
  actions,
  isLoading,
  emptyMessage,
  toolbarAction,
  sorting,
  pagination,
  search,
  filters,
  meta,
}: DataTableProps<TData>) => {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);
  const showLoadingOverlay = Boolean(isLoading) && hasHydrated;
  const hasActions = Boolean(
    actions && (actions.onView || actions.onEdit || actions.onDelete),
  );
  const tableColumn: ColumnDef<TData>[] =
    hasActions || rowActions
      ? [
          ...columns,
          {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            enableSorting: false,
            cell: ({ row }) => {
              const rawData = row.original;
              return (
                <div className="flex items-center justify-end gap-2">
                  {rowActions?.(rawData)}
                  {hasActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="h-8 w-8 p-0">
                          <span className="sr-only">Open row menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions?.onView && (
                          <DropdownMenuItem
                            onClick={() => actions.onView?.(rawData)}
                          >
                            View
                          </DropdownMenuItem>
                        )}
                        {actions?.onEdit && (
                          <DropdownMenuItem
                            onClick={() => actions.onEdit?.(rawData)}
                          >
                            Edit
                          </DropdownMenuItem>
                        )}
                        {actions?.onDelete && (
                          <DropdownMenuItem
                            onClick={() => actions.onDelete?.(rawData)}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            },
          },
        ]
      : columns;
  const table = useReactTable({
    data,
    columns: tableColumn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getCoreRowModel(),
    getPaginationRowModel: getCoreRowModel(),
    manualSorting: !!sorting,
    manualPagination: !!pagination,
    pageCount: pagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
    state: {
      ...(sorting ? { sorting: sorting.state } : {}),
      ...(pagination ? { pagination: pagination.state } : {}),
    },
    onSortingChange: sorting
      ? (updater) => {
          const currentSortingState = sorting.state;
          const nextSortingState =
            typeof updater === "function"
              ? updater(currentSortingState)
              : updater;
          sorting.onSortingChange(nextSortingState);
        }
      : undefined,
    onPaginationChange: pagination
      ? (updater) => {
          const currentPaginationState = pagination.state;
          const nextPaginationState =
            typeof updater === "function"
              ? updater(currentPaginationState)
              : updater;
          pagination.onPaginationChange(nextPaginationState);
        }
      : undefined,
  });
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-xs">
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-0.5 text-[13px] font-medium text-primary hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      )}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
      {(search || filters || toolbarAction) && (
        <div className="flex flex-wrap items-start gap-3 px-5 pt-4">
          {search && (
            <DataTableSearch
              key={search.initialValue ?? ""}
              initialValue={search.initialValue}
              placeholder={search.placeholder}
              debounceMs={search.debounceMs}
              isLoading={isLoading}
              onDebounceChange={search.onDebounceChange}
            />
          )}
          {filters && (
            <DataTableFilters
              filters={filters.configs}
              values={filters.values}
              onFilterChange={filters.onFilterChange}
              onClearAll={filters.onClearAll}
              isLoading={isLoading}
            />
          )}
          {toolbarAction && (
            <div className="ml-auto shrink-0">{toolbarAction}</div>
          )}
        </div>
      )}
      <div className={title || viewAllHref || search || filters || toolbarAction ? "mt-4" : undefined}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/60 hover:bg-muted/60">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-5 text-xs font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        variant={"ghost"}
                        onClick={header.column.getToggleSortingHandler()}
                        className="h-auto cursor-pointer p-0 font-semibold hover:bg-transparent hover:text-inherit focus-visible:ring-0"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumn.length}
                  className="h-28 text-center text-muted-foreground"
                >
                  {emptyMessage || "Nothing here yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {pagination && (
          <DataTablePagination
            table={table}
            totalRows={meta?.total}
            totalPages={meta?.totalPages}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;
