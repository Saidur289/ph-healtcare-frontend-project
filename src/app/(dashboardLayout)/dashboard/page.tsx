import DashboardGreeting from "@/components/modules/Dashboard/DashboardGreeting";
import NextAppointmentCard from "@/components/modules/Patient/Dashboard/NextAppointmentCard";
import QuickActions from "@/components/modules/Patient/Dashboard/QuickActions";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import ErrorState from "@/components/shared/ErrorState";
import StatsCard from "@/components/shared/StatsCard";
import { formatTaka } from "@/lib/appointmentUtils";
import { getMyAppointments } from "@/services/appointment.services";
import { getUserInfo } from "@/services/auth.service";
import { getDashboardData } from "@/services/dashboard.service";
import { IPatientDashboardData } from "@/types/dashboard.types";

const PatientDashboardPage = async () => {
  const [user, stats, appointments] = await Promise.all([
    getUserInfo(),
    getDashboardData<IPatientDashboardData>(),
    getMyAppointments().catch(() => null),
  ]);
  const data = stats.data;

  // sections cascade in; the numbers and the next-up card tilt toward the pointer
  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <DashboardGreeting name={user?.name ?? ""} />
      </StaggerItem>

      {!data ? (
        <StaggerItem>
          <ErrorState message="Could not load your dashboard numbers." />
        </StaggerItem>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem>
            <StatsCard
              tilt
              title="Upcoming Appointments"
              value={data.upcomingCount}
              iconName="CalendarCheck"
              tone="blue"
              description={`${data.appointmentCount} booked in total`}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              tilt
              title="Prescriptions"
              value={data.prescriptionCount}
              iconName="FileText"
              tone="teal"
              description="Issued by your doctors"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              tilt
              title="Total Paid"
              value={formatTaka(data.totalPaid)}
              iconName="Wallet"
              tone="green"
              description={`${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"} written`}
            />
          </StaggerItem>
        </Stagger>
      )}

      <StaggerItem className="grid gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          {appointments ? (
            <NextAppointmentCard appointments={appointments.data ?? []} />
          ) : (
            <ErrorState message="Could not load your appointments." />
          )}
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </StaggerItem>
    </Stagger>
  );
};

export default PatientDashboardPage;
