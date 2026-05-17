"use client";
import DataTable from "@/components/shared/table/DataTable";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { useQuery } from "@tanstack/react-query";
import { doctorColumn } from "./doctorsColumns";
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useSearchParams } from "next/navigation";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useMemo } from "react";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { ISpecialty } from "@/types/specialty.types";
import { PaginationMeta } from "@/types/api.types";
import {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";

import CreateDoctorFormModal from "./CreateDoctorFormModal";
import DeleteDoctorConfirmationDialog from "./DeleteDoctorConfirmationDialog";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { IDoctors } from "@/types/doctor.types";
import EditDoctorFormModal from "./EditDoctorFormModal";
import ViewDoctorProfileDialog from "./ViewDoctorProfileDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const SPECIALTIES_FILTER_KEY = "specialties.specialty.title";
const APPOINTMENT_FEE_FILTER_KEY = "appointmentFee";
const DOCTOR_FILTER_DEFINITION = [
  serverManagedFilter.single("gender"),
  serverManagedFilter.multi(SPECIALTIES_FILTER_KEY),
  serverManagedFilter.range(APPOINTMENT_FEE_FILTER_KEY),
];

const DoctorTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
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

  const {
    isDeleteDialogOpen,
    isViewDialogOpen,
    isEditDialogOpen,
    viewingItem,
    deletingItem,
    tableActions,
    editingItem,
    onViewOpenChange,
    onDeleteOpenChange,
    onEditOpenChange,
  } = useRowActionModalState<IDoctors>({
    enableView: true,
    enableEdit: true,
    enableDelete: true,
  });
  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({ searchParams, updateParams });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({
      searchParams,
      definitions: DOCTOR_FILTER_DEFINITION,
      updateParams,
    });
  const {
    data: doctorsDataResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["doctors", queryString],
    queryFn: () => getDoctors(queryString),
    refetchOnWindowFocus: "always",
  });
  const { data: specialtiesDataResponse, isLoading: isLoadingSpecialties } =
    useQuery({
      queryKey: ["specialties"],
      queryFn: getAllSpecialties,
      staleTime: 1000 * 60 * 60 * 6,
      gcTime: 1000 * 60 * 60 * 24,
    });

  const doctors = doctorsDataResponse?.data ?? [];
  const specialties = useMemo<ISpecialty[]>(
    () => specialtiesDataResponse?.data ?? [],
    [specialtiesDataResponse],
  );
  const meta: PaginationMeta | undefined = doctorsDataResponse?.meta;
  const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
    return [
      {
        id: "gender",
        type: "single-select",
        label: "Gender",
        options: [
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
          { label: "Other", value: "OTHER" },
        ],
      },
      {
        id: SPECIALTIES_FILTER_KEY,
        label: "Specialties",
        type: "multi-select",
        options: specialties.map((specialty) => ({
          label: specialty.title,
          value: specialty.title,
        })),
      },
      {
        id: "appointmentFee",
        label: "Fee Range",
        type: "range",
      },
    ];
  }, [specialties]);
  const filterValuesForTable = useMemo<DataTableFilterValues>(() => {
    return {
      gender: filterValues.gender,
      [SPECIALTIES_FILTER_KEY]: filterValues[SPECIALTIES_FILTER_KEY],
      appointmentFee: filterValues[APPOINTMENT_FEE_FILTER_KEY],
    };
  }, [filterValues]);

  return (
    <>
      <DataTable
        data={doctors}
        columns={doctorColumn}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No doctors found"
        sorting={{
          state: optimisticSortingState,
          onSortingChange: handleSortingChange,
        }}
        pagination={{
          state: optimisticPaginationState,
          onPaginationChange: handlePaginationChange,
        }}
        meta={meta}
        search={{
          initialValue: searchTermFromUrl,
          placeholder: "Search doctors by name or email...",
          debounceMs: 700,
          onDebounceChange: handleDebouncedSearchChange,
        }}
        filters={{
          configs: filterConfigs,
          values: filterValuesForTable,
          onFilterChange: handleFilterChange,
          onClearAll: clearAllFilters,
        }}
        actions={tableActions}
        toolbarAction={
          <CreateDoctorFormModal
            specialties={specialties}
            isLoadingSpecialties={isLoadingSpecialties}
          />
        }
      />
      <EditDoctorFormModal
        open={isEditDialogOpen}
        onOpenChange={onEditOpenChange}
        doctor={editingItem}
        specialties={specialties}
        isLoadingSpecialties={isLoadingSpecialties}
      />
      <ViewDoctorProfileDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        doctor={viewingItem}
      />

      <DeleteDoctorConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        doctor={deletingItem}
      />
    </>
  );
};

export default DoctorTable;
