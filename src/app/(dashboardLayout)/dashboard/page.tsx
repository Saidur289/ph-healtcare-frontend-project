import DashboardGreeting from "@/components/modules/Dashboard/DashboardGreeting";
import NextAppointmentCard from "@/components/modules/Patient/Dashboard/NextAppointmentCard";
import ErrorState from "@/components/shared/ErrorState";
import StatsCard from "@/components/shared/StatsCard";
import { Card } from "@/components/ui/card";
import { formatTaka } from "@/lib/appointmentUtils";
import { getMyAppointments } from "@/services/appointment.services";
import { getUserInfo } from "@/services/auth.service";
import { getDashboardData } from "@/services/dashboard.service";
import { IPatientDashboardData } from "@/types/dashboard.types";
import { CalendarPlus, ChevronRight, FileText, HeartPulse, KeyRound, LucideIcon } from "lucide-react";
import Link from "next/link";

const QUICK_ACTIONS: { title: string; description: string; href: string; icon: LucideIcon }[] = [
  { title: "Book appointment", description: "Find a doctor and pick a slot", href: "/consultation", icon: CalendarPlus },
  { title: "My prescriptions", description: "Download your prescription PDFs", href: "/dashboard/my-prescriptions", icon: FileText },
  { title: "Health records", description: "Your health data and reports", href: "/dashboard/health-records", icon: HeartPulse },
  { title: "Change password", description: "Keep your account secure", href: "/change-password", icon: KeyRound },
];

const PatientDashboardPage = async () => {
  const [user, stats, appointments] = await Promise.all([
    getUserInfo(),
    getDashboardData<IPatientDashboardData>(),
    getMyAppointments().catch(() => null),
  ]);
  const data = stats.data;

  return (
    <div className="space-y-6">
      <DashboardGreeting name={user?.name ?? ""} />

      {!data ? (
        <ErrorState message="Could not load your dashboard numbers." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Upcoming Appointments"
            value={data.upcomingCount}
            iconName="CalendarCheck"
            tone="blue"
            description={`${data.appointmentCount} booked in total`}
          />
          <StatsCard
            title="Prescriptions"
            value={data.prescriptionCount}
            iconName="FileText"
            tone="teal"
            description="Issued by your doctors"
          />
          <StatsCard
            title="Total Paid"
            value={formatTaka(data.totalPaid)}
            iconName="Wallet"
            tone="green"
            description={`${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"} written`}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          {appointments ? (
            <NextAppointmentCard appointments={appointments.data ?? []} />
          ) : (
            <ErrorState message="Could not load your appointments." />
          )}
        </div>
        <Card className="gap-1 p-2 shadow-xs lg:col-span-2">
          <p className="px-3 pb-1 pt-3 text-[15px] font-semibold">Quick actions</p>
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{title}</span>
                <span className="block truncate text-xs text-muted-foreground">{description}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
