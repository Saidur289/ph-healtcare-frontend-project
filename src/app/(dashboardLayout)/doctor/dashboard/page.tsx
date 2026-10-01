import DashboardGreeting from "@/components/modules/Dashboard/DashboardGreeting";
import UpcomingAppointmentsTable from "@/components/modules/Doctor/Dashboard/UpcomingAppointmentsTable";
import ErrorState from "@/components/shared/ErrorState";
import StatsCard from "@/components/shared/StatsCard";
import StatusPill from "@/components/shared/StatusPill";
import { Card } from "@/components/ui/card";
import { formatTaka } from "@/lib/appointmentUtils";
import { getMyAppointments } from "@/services/appointment.services";
import { getUserInfo } from "@/services/auth.service";
import { getDashboardData } from "@/services/dashboard.service";
import { IDoctorDashboardData } from "@/types/dashboard.types";
import { Star } from "lucide-react";

const diffLabel = (diff: number) => (diff === 0 ? "same as yesterday" : "vs yesterday");

const DoctorDashboardPage = async () => {
  // independent requests in parallel
  const [user, stats, appointments] = await Promise.all([
    getUserInfo(),
    getDashboardData<IDoctorDashboardData>(),
    getMyAppointments().catch(() => null),
  ]);
  const data = stats.data;

  return (
    <div className="space-y-6">
      <DashboardGreeting name={`Dr. ${user?.name ?? ""}`} />

      {!data ? (
        <ErrorState message="Could not load your dashboard numbers." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Appointments Today"
            value={data.todayAppointmentCount}
            iconName="CalendarCheck"
            tone="blue"
            trend={{
              diff: data.todayAppointmentCount - data.yesterdayAppointmentCount,
              label: diffLabel(data.todayAppointmentCount - data.yesterdayAppointmentCount),
            }}
          />
          <StatsCard
            title="Total Patients"
            value={data.patientCount}
            iconName="Users"
            tone="teal"
            trend={{ diff: data.newPatientsToday, label: "new today" }}
          />
          <StatsCard
            title="Today's Earnings"
            value={formatTaka(data.todayRevenue)}
            iconName="Wallet"
            tone="green"
            trend={{
              diff: data.todayRevenue - data.yesterdayRevenue,
              display: formatTaka(Math.abs(data.todayRevenue - data.yesterdayRevenue)),
              label: diffLabel(data.todayRevenue - data.yesterdayRevenue),
            }}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          {appointments ? (
            <UpcomingAppointmentsTable appointments={appointments.data ?? []} />
          ) : (
            <ErrorState message="Could not load your appointments." />
          )}
        </div>

        {data && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:content-start">
            <Card className="gap-3 p-5 shadow-xs">
              <p className="text-[15px] font-semibold">Rating</p>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden />
                <span className="text-[28px] font-semibold leading-none">{data.averageRating.toFixed(1)}</span>
                <span className="text-[13px] text-muted-foreground">/ 5</span>
              </div>
              <p className="text-xs text-muted-foreground">
                From {data.reviewCount} review{data.reviewCount === 1 ? "" : "s"} · total earnings{" "}
                {formatTaka(data.totalRevenue)}
              </p>
            </Card>
            <Card className="gap-3 p-5 shadow-xs">
              <p className="text-[15px] font-semibold">All appointments</p>
              {data.appointmentStatusDistribution.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No appointments yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.appointmentStatusDistribution.map((item) => (
                    <li key={item.status} className="flex items-center justify-between text-[13px]">
                      <StatusPill status={item.status} />
                      <span className="font-medium">{item.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
