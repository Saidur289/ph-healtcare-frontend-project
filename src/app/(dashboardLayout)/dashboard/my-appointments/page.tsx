import PatientAppointmentsList from "@/components/modules/Patient/Appointments/PatientAppointmentsList";
import PaymentResultBanner from "@/components/modules/Patient/Appointments/PaymentResultBanner";
import { getMyAppointments } from "@/services/appointment.services";

// Stripe returns here: ?payment=success|cancelled&appointment_id=...
// Pay later bookings land here with ?status=pay_later_booked
const MyAppointmentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    payment?: string;
    appointment_id?: string;
    status?: string;
  }>;
}) => {
  const params = await searchParams;
  const response = await getMyAppointments();
  const payLaterBooked = params.status === "pay_later_booked";

  return (
    <div>
      <PaymentResultBanner
        payment={params.payment}
        appointmentId={params.appointment_id}
      />
      <PatientAppointmentsList
        appointments={response.data}
        feedbackType={payLaterBooked ? "success" : undefined}
        feedbackMessage={
          payLaterBooked
            ? "Appointment booked. Please pay before the payment deadline, otherwise it is cancelled automatically."
            : undefined
        }
      />
    </div>
  );
};

export default MyAppointmentsPage;
