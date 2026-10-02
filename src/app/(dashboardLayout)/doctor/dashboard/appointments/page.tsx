import DoctorAppointmentsList from "@/components/modules/Doctor/Appointments/DoctorAppointmentsList";
import ErrorState from "@/components/shared/ErrorState";
import { getMyAppointments } from "@/services/appointment.services";

const DoctorAppointmentsPage = async () => {
  const response = await getMyAppointments().catch(() => null);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Appointments</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Start paid calls from 10 minutes before the slot, complete them and write prescriptions.
        </p>
      </div>
      {response ? (
        <DoctorAppointmentsList appointments={response.data ?? []} />
      ) : (
        <ErrorState message="Could not load your appointments." />
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
