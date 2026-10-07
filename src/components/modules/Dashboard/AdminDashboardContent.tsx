"use client";

import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { TiltCard } from "@/components/motion/TiltCard";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import ErrorState from "@/components/shared/ErrorState";
import StatsCard from "@/components/shared/StatsCard";
import { formatTaka } from "@/lib/appointmentUtils";
import { queryKeys } from "@/lib/queryKeys";
import { getDashboardData } from "@/services/dashboard.service";
import { IAdminDashboardData } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";

// the chart library is large: load it only on this page, in the browser, after the stats
const chartPlaceholder = () => <Skeleton className="h-[380px] w-full rounded-xl" />;
const AppointmentBarChart = dynamic(() => import("@/components/shared/AppointmentBarChart"), { ssr: false, loading: chartPlaceholder });
const AppointmentPieChart = dynamic(() => import("@/components/shared/AppointmentPieChart"), { ssr: false, loading: chartPlaceholder });

const AdminDashboardContent = () => {
  const { data: response, refetch, isFetching } = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => getDashboardData<IAdminDashboardData>(),
  });
  const data = response?.data;

  if (!data) {
    return <ErrorState message="Could not load the dashboard numbers." onRetry={() => !isFetching && refetch()} />;
  }

  // numbers cascade in and lean toward the pointer; the charts lean only slightly, so they stay readable
  return (
    <Stagger className="space-y-4">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatsCard
            tilt
            title="Total Appointments"
            value={data.appointmentCount ?? 0}
            iconName="CalendarDays"
            tone="blue"
            description="All bookings on the platform"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            tilt
            title="Doctors"
            value={data.doctorCount ?? 0}
            iconName="Stethoscope"
            tone="teal"
            description="Registered doctors"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            tilt
            title="Patients"
            value={data.patientCount ?? 0}
            iconName="Users"
            tone="amber"
            description="Registered patients"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            tilt
            title="Revenue"
            value={formatTaka(data.totalRevenue)}
            iconName="Wallet"
            tone="green"
            description={`${data.paymentCount ?? 0} payments`}
          />
        </StaggerItem>
      </Stagger>
      <StaggerItem className="grid gap-4 lg:grid-cols-5">
        <TiltCard max={2} className="min-w-0 rounded-xl lg:col-span-3">
          <AppointmentBarChart data={data.barChartData ?? []} />
        </TiltCard>
        <TiltCard max={2} className="min-w-0 rounded-xl lg:col-span-2">
          <AppointmentPieChart
            data={data.pieChartData ?? []}
            title="Appointment Status"
            description="Share of appointments by status"
          />
        </TiltCard>
      </StaggerItem>
    </Stagger>
  );
};

export default AdminDashboardContent;
