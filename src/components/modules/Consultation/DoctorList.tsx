"use client";

import DataTableFilters, {
  DataTableFilterConfig,
  DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import BookAppointmentModal from "@/components/modules/Patient/Appointments/BookAppointmentModal";
import DoctorCard from "@/components/modules/Public/DoctorCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { springs } from "@/lib/motion";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import {
  serverManagedFilter,
  useServerManagedDataTableFilters,
} from "@/hooks/useServerManagedDataTableFilters";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDataTableSearch";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import { type IDoctors } from "@/types/doctor.types";
import { type ISpecialty } from "@/types/specialty.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const SPECIALTIES_FILTER_KEY = "specialties.specialty.title";
const APPOINTMENT_FEE_FILTER_KEY = "appointmentFee";
const MIN_RATING_FILTER_ID = "minRating";
const MIN_RATING_QUERY_KEY = "averageRating[gte]";
const CONSULTATION_ALLOWED_QUERY_KEYS = new Set([
  "page",
  "limit",
  "sortBy",
  "sortOrder",
  "searchTerm",
  "gender",
  SPECIALTIES_FILTER_KEY,
  `${APPOINTMENT_FEE_FILTER_KEY}[gte]`,
  `${APPOINTMENT_FEE_FILTER_KEY}[lte]`,
  MIN_RATING_QUERY_KEY,
]);

const CONSULTATION_FILTER_DEFINITIONS = [
  serverManagedFilter.single("gender"),
  serverManagedFilter.multi(SPECIALTIES_FILTER_KEY),
  serverManagedFilter.range(APPOINTMENT_FEE_FILTER_KEY),
  serverManagedFilter.single(MIN_RATING_FILTER_ID, MIN_RATING_QUERY_KEY),
];

const getSanitizedConsultationQueryString = (queryString: string) => {
  const currentParams = new URLSearchParams(queryString);
  const sanitizedParams = new URLSearchParams();

  currentParams.forEach((value, key) => {
    if (!CONSULTATION_ALLOWED_QUERY_KEYS.has(key)) {
      return;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return;
    }

    if (key === SPECIALTIES_FILTER_KEY) {
      sanitizedParams.append(key, normalizedValue);
      return;
    }

    sanitizedParams.set(key, normalizedValue);
  });

  return sanitizedParams.toString();
};

const Pagination = ({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isLoading || currentPage <= 1}
      >
        Prev
      </Button>

      {pageNumbers.map((page) => (
        <Button
          key={page}
          type="button"
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
        >
          {page}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLoading || currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

const DoctorsList = ({
  initialQueryString,
  isAuthenticated,
  viewerRole,
}: {
  initialQueryString: string;
  isAuthenticated: boolean;
  viewerRole?: string | null;
}) => {
  const searchParams = useSearchParams();

  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  });

  const queryString = useMemo(() => {
    return getSanitizedConsultationQueryString(
      queryStringFromUrl || initialQueryString,
    );
  }, [initialQueryString, queryStringFromUrl]);

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const { filterValues, handleFilterChange, clearAllFilters } =
    useServerManagedDataTableFilters({
      searchParams,
      definitions: CONSULTATION_FILTER_DEFINITIONS,
      updateParams,
    });

  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["doctors", queryString],
    queryFn: () => getDoctors(queryString),
  });

  const { data: specialtiesResponse } = useQuery({
    queryKey: ["specialties"],
    queryFn: getAllSpecialties,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const doctors = doctorsResponse?.data ?? [];
  const meta = doctorsResponse?.meta;
  const specialties = useMemo(
    () => specialtiesResponse?.data ?? [],
    [specialtiesResponse?.data],
  );

  const filterConfigs = useMemo<DataTableFilterConfig[]>(() => {
    return [
      {
        id: "gender",
        label: "Gender",
        type: "single-select",
        options: [
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
        ],
      },
      {
        id: SPECIALTIES_FILTER_KEY,
        label: "Specialties",
        type: "multi-select",
        options: specialties.map((specialty: ISpecialty) => ({
          label: specialty.title,
          value: specialty.title,
        })),
      },
      {
        id: APPOINTMENT_FEE_FILTER_KEY,
        label: "Fee Range",
        type: "range",
      },
      {
        id: MIN_RATING_FILTER_ID,
        label: "Rating",
        type: "single-select",
        options: [
          { label: "4.5 and up", value: "4.5" },
          { label: "4 and up", value: "4" },
          { label: "3 and up", value: "3" },
        ],
      },
    ];
  }, [specialties]);

  const filterValuesForControls = useMemo<DataTableFilterValues>(() => {
    return {
      gender: filterValues.gender,
      [SPECIALTIES_FILTER_KEY]: filterValues[SPECIALTIES_FILTER_KEY],
      [APPOINTMENT_FEE_FILTER_KEY]: filterValues[APPOINTMENT_FEE_FILTER_KEY],
      [MIN_RATING_FILTER_ID]: filterValues[MIN_RATING_FILTER_ID],
    };
  }, [filterValues]);

  const isBusy = isLoading || isFetching || isRouteRefreshPending;

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find a doctor</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Compare specialists by fee, experience and rating, then book a video
          consultation.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <DataTableSearch
            key={searchTermFromUrl}
            initialValue={searchTermFromUrl}
            placeholder="Search by name, specialty or hospital…"
            debounceMs={700}
            onDebounceChange={handleDebouncedSearchChange}
            isLoading={isBusy}
          />

          <DataTableFilters
            filters={filterConfigs}
            values={filterValuesForControls}
            onFilterChange={handleFilterChange}
            onClearAll={clearAllFilters}
            isLoading={isBusy}
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort</span>
            <Select
              value={
                optimisticSortingState[0]?.id
                  ? `${optimisticSortingState[0]?.id}:${optimisticSortingState[0]?.desc ? "desc" : "asc"}`
                  : "default"
              }
              onValueChange={(value) => {
                if (value === "default") {
                  handleSortingChange([]);
                  return;
                }

                const [sortBy, sortOrder] = value.split(":");
                handleSortingChange([
                  { id: sortBy, desc: sortOrder === "desc" },
                ]);
              }}
            >
              <SelectTrigger className="w-55" disabled={isBusy}>
                <SelectValue placeholder="Sort doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="averageRating:desc">
                  Rating (High to Low)
                </SelectItem>
                <SelectItem value="appointmentFee:asc">
                  Fee (Low to High)
                </SelectItem>
                <SelectItem value="experience:desc">
                  Experience (High to Low)
                </SelectItem>
                <SelectItem value="createdAt:desc">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isBusy && (
        <div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          aria-busy="true"
          aria-label="Loading doctors"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {!isBusy && doctors.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No doctors match your search"
          description="Try another name or specialty, or clear the filters."
          action={
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {!isBusy && doctors.length > 0 && (
        <>
          {/* each new result set cascades in; cards lift toward the pointer */}
          <Stagger
            key={queryString}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {doctors.map((doctor: IDoctors) => (
              <StaggerItem
                key={String(doctor.id)}
                whileHover={{ y: -4 }}
                transition={springs.snappy}
                className="h-full"
              >
                <DoctorCard
                  key={String(doctor.id)}
                  doctor={doctor}
                  action={
                    <BookAppointmentModal
                      doctorId={String(doctor.id)}
                      doctorName={doctor.name}
                      isAuthenticated={isAuthenticated}
                      viewerRole={viewerRole}
                      triggerClassName="w-full"
                      fullWidth
                    />
                  }
                />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="space-y-3 pt-2">
            <Pagination
              currentPage={optimisticPaginationState.pageIndex + 1}
              totalPages={meta?.totalPages ?? 1}
              isLoading={isBusy}
              onPageChange={(page) => {
                handlePaginationChange({
                  pageIndex: page - 1,
                  pageSize: optimisticPaginationState.pageSize,
                });
              }}
            />

            <p className="text-center text-sm text-muted-foreground">
              Total {meta?.total ?? doctors.length} doctors
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default DoctorsList;
