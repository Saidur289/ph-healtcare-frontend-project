"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getSchedules } from "@/services/schedule.services";
import { PaginationMeta } from "@/types/api.types";
import { ISchedule } from "@/types/schedule.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { schedulesColumns } from "./schedulesColumns";
import CreateScheduleFormModal from "./CreateScheduleFormModal";
import EditScheduleFormModal from "./EditScheduleFormModel";
import ViewScheduleDialog from "./ViewScheduleDialog";
import DeleteScheduleConfirmationDialog from "./DeleteScheduleConfirmationDialog";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const SchedulesTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isViewDialogOpen,
    onDeleteOpenChange,
    onViewOpenChange,
    onEditOpenChange,
    viewingItem,
    editingItem,
    deletingItem,
    tableActions,
  } = useRowActionModalState<ISchedule>();
  const {
    queryStringFromUrl,
    optimisticPaginationState,
    optimisticSortingState,
    isRouteRefreshPending,
    updateParams,
    handlePaginationChange,
    handleSortingChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  });
  const queryString = queryStringFromUrl || initialQueryString;
  console.log("page.tsx schedules-management", queryString);
  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({ searchParams, updateParams });
  const {
    data: schedulesResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["schedules", queryString],
    queryFn: () => getSchedules(queryString),
  });
  const schedules = schedulesResponse?.data ?? [];
  const meta: PaginationMeta | undefined = schedulesResponse?.meta;
  return (
    <>
      <DataTable
        data={schedules}
        columns={schedulesColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No Schedules Found"
        sorting={{
          state: optimisticSortingState,
          onSortingChange: handleSortingChange,
        }}
        pagination={{
          state: optimisticPaginationState,
          onPaginationChange: handlePaginationChange,
        }}
        search={{
          initialValue: searchTermFromUrl,
          placeholder: "Search schedule by id or datetime......",
          debounceMs: 700,
          onDebounceChange: handleDebouncedSearchChange,
        }}
        toolbarAction={<CreateScheduleFormModal />}
        meta={meta}
        actions={tableActions}
      />
      <EditScheduleFormModal
        open={isEditDialogOpen}
        onOpenChange={onEditOpenChange}
        schedule={editingItem}
      />
      <ViewScheduleDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        schedule={viewingItem}
      />
      <DeleteScheduleConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        schedule={deletingItem}
      />
    </>
  );
};

export default SchedulesTable;
