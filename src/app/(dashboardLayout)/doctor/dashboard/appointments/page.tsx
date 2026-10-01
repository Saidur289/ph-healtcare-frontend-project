import DoctorAppointmentsList from "@/components/modules/Doctor/Appointments/DoctorAppointmentsList";
import { getMyAppointments } from "@/services/appointment.services";

const DoctorAppointmentsPage = async () => {
  const response = await getMyAppointments();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Join paid consultations from 10 minutes before they start, complete them and write prescriptions.
        </p>
      </div>
      <DoctorAppointmentsList appointments={response.data} />
    </div>
  );
};

export default DoctorAppointmentsPage;
