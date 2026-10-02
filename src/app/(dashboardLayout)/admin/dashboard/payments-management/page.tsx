import AdminPaymentsTable from "@/components/modules/Admin/Payments/AdminPaymentsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getPaymentsForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const PaymentsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-payments", queryString],
    queryFn: () => getPaymentsForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Payments"
        description="Stripe payments and invoices. A refund cancels the appointment; completed visits can't be refunded here."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminPaymentsTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default PaymentsManagementPage;
