import SchedulesTable from "@/components/modules/Admin/ScheduleManagement/SchedulesTable";
import { getSchedules } from "@/services/schedule.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const SchedulesManagementsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const queryParamsObjects = await searchParams;
  const queryString = Object.keys(queryParamsObjects)
    .map((key) => {
      const value = queryParamsObjects[key];
      if (value === undefined) {
        return "";
      }
      if (Array.isArray(value)) {
        return value
          .map(
            (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
          )
          .join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join("&");
  console.log("page.tsx schedules-management", queryString);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["schedules", queryString],
    queryFn: () => getSchedules(queryString),
    staleTime: 1000 * 60 * 60, // 30 seconds data stays fresh if this data access is less than 30 seconds it will use cached data it will not make request
    gcTime: 1000 * 60 * 60 * 5, // 5 minutes garbage collection after this time  remove the cached and make new memory
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulesTable initialQueryString={queryString} />
    </HydrationBoundary>
  );
};

export default SchedulesManagementsPage;
