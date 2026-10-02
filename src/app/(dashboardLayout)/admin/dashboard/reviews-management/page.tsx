import AdminReviewsTable from "@/components/modules/Admin/Reviews/AdminReviewsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getReviewsForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const ReviewsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-reviews", queryString],
    queryFn: () => getReviewsForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Reviews"
        description="Moderate patient reviews. Hidden reviews leave the public profile and the doctor's rating."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminReviewsTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default ReviewsManagementPage;
