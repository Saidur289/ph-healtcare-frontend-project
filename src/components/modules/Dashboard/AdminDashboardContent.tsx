"use client";

import AppointmentBarChart from "@/components/shared/AppointmentBarChart";
import AppointmentPieChart from "@/components/shared/AppointmentPieChart";
import ErrorState from "@/components/shared/ErrorState";
import StatsCard from "@/components/shared/StatsCard";
import { formatTaka } from "@/lib/appointmentUtils";
import { queryKeys } from "@/lib/queryKeys";
import { getDashboardData } from "@/services/dashboard.service";
import { IAdminDashboardData } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";

const AdminDashboardContent = () => {
  const { data: response, refetch, isFetching } = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => getDashboardData<IAdminDashboardData>(),
    refetchOnWindowFocus: "always",
  });
  const data = response?.data;

  if (!data) {
    return <ErrorState message="Could not load the dashboard numbers." onRetry={() => !isFetching && refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Appointments"
          value={data.appointmentCount ?? 0}
          iconName="CalendarDays"
          tone="blue"
          description="All bookings on the platform"
        />
        <StatsCard
          title="Doctors"
          value={data.doctorCount ?? 0}
          iconName="Stethoscope"
          tone="teal"
          description="Registered doctors"
        />
        <StatsCard
          title="Patients"
          value={data.patientCount ?? 0}
          iconName="Users"
          tone="amber"
          description="Registered patients"
        />
        <StatsCard
          title="Revenue"
          value={formatTaka(data.totalRevenue)}
          iconName="Wallet"
          tone="green"
          description={`${data.paymentCount ?? 0} payments`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <AppointmentBarChart data={data.barChartData ?? []} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <AppointmentPieChart
            data={data.pieChartData ?? []}
            title="Appointment Status"
            description="Share of appointments by status"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
