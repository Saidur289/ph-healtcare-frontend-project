"use client";
import { setReviewVisibilityAction } from "@/app/_actions/admin.actions";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import StatusPill from "@/components/shared/StatusPill";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { formatDay } from "@/lib/appointmentUtils";
import { cn } from "@/lib/utils";
import { getReviewsForAdmin } from "@/services/admin.services";
import { IAdminReview } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

const columns: ColumnDef<IAdminReview>[] = [
  {
    id: "rating",
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <span className="flex" aria-label={`${row.original.rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={cn("h-3.5 w-3.5", n <= row.original.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} aria-hidden />
        ))}
      </span>
    ),
  },
  {
    id: "comment",
    header: "Comment",
    enableSorting: false,
    // plain text (the API strips HTML); React escapes it
    cell: ({ row }) => (
      <span className="block max-w-sm">
        <span className="line-clamp-2 text-[13px]">{row.original.comment || "—"}</span>
        {row.original.isHidden && row.original.hiddenReason && (
          <span className="mt-0.5 block text-xs text-muted-foreground">Hidden: {row.original.hiddenReason}</span>
        )}
      </span>
    ),
  },
  {
    id: "people",
    header: "Patient → Doctor",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-[13px]">
        {row.original.patient?.name}
        <span className="block text-xs text-muted-foreground">Dr. {row.original.doctor?.name}</span>
      </span>
    ),
  },
  { id: "createdAt", accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDay(row.original.createdAt) },
  {
    id: "isHidden",
    accessorKey: "isHidden",
    header: "Visibility",
    cell: ({ row }) => (row.original.isHidden ? <StatusPill tone="red">Hidden</StatusPill> : <StatusPill tone="green">Public</StatusPill>),
  },
];

const AdminReviewsTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminReview>
    queryKey="admin-reviews"
    fetcher={getReviewsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search comments, patients or doctors…"
    emptyMessage="No reviews found."
    filterDefinitions={[serverManagedFilter.single("isHidden"), serverManagedFilter.single("rating")]}
    filterConfigs={[
      {
        id: "isHidden",
        label: "Visibility",
        type: "single-select",
        options: [
          { label: "Public", value: "false" },
          { label: "Hidden", value: "true" },
        ],
      },
      {
        id: "rating",
        label: "Rating",
        type: "single-select",
        options: [5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n === 1 ? "" : "s"}`, value: String(n) })),
      },
    ]}
    rowActions={(review) =>
      review.isHidden ? (
        <ConfirmActionDialog
          trigger="Show"
          title="Show this review again?"
          description="It appears on the doctor's public profile and counts in the rating again."
          confirmLabel="Show review"
          onConfirm={() => setReviewVisibilityAction(review.id, false)}
          invalidate={["admin-reviews"]}
        />
      ) : (
        <ConfirmActionDialog
          trigger="Hide"
          title="Hide this review?"
          description="It is removed from the doctor's public profile and no longer counts in the rating. You can show it again later."
          confirmLabel="Hide review"
          destructive
          withReason={{ label: "Reason (kept for the record)", required: true }}
          onConfirm={(reason) => setReviewVisibilityAction(review.id, true, reason)}
          invalidate={["admin-reviews"]}
        />
      )
    }
  />
);

export default AdminReviewsTable;
