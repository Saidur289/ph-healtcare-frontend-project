import DoctorSchedulesTable from "@/components/modules/Doctor/DoctorSchedules/DoctorSchedulesTable";
import ScheduleViewTabs from "@/components/modules/Doctor/DoctorSchedules/ScheduleViewTabs";
import ScheduleWeekCalendar from "@/components/modules/Doctor/DoctorSchedules/ScheduleWeekCalendar";
import { getMyDoctorSchedules } from "@/services/doctorSchedule.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

const MySchedulesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { view: rawView, ...rest } = await searchParams;
  const view = rawView === "list" ? "list" : "calendar";

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">My Schedules</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Add the time slots patients can book, and remove free ones you can&apos;t take.
        </p>
      </div>
      <ScheduleViewTabs view={view} />
    </div>
  );

  if (view === "calendar") {
    // the calendar loads its week in the browser (it needs the viewer's clock)
    return (
      <div className="space-y-5">
        {header}
        <ScheduleWeekCalendar />
      </div>
    );
  }

  const queryString = Object.entries(rest)
    .flatMap(([key, value]) =>
      value === undefined
        ? []
        : (Array.isArray(value) ? value : [value]).map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`),
    )
    .join("&");

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["my-doctor-schedules", queryString],
    queryFn: () => getMyDoctorSchedules(queryString),
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-5">
      {header}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoctorSchedulesTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default MySchedulesPage;
