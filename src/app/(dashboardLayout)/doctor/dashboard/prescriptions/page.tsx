import PrescriptionForm from "@/components/modules/Doctor/Prescriptions/PrescriptionForm";
import PrescriptionList from "@/components/modules/Shared/PrescriptionList";
import { getMyAppointments } from "@/services/appointment.services";
import { getMyPrescriptions } from "@/services/consultation.services";

// ?appointmentId=... opens the form for that appointment (from the call or the appointments list)
const DoctorPrescriptionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) => {
  const { appointmentId } = await searchParams;
  const [prescriptions, appointments] = await Promise.all([getMyPrescriptions(), getMyAppointments()]);
  const target = appointmentId
    ? appointments.data.find((a) => a.id === appointmentId)
    : undefined;
  const canWrite =
    target && (target.status === "INPROGRESS" || target.status === "COMPLETED") && !target.prescription;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
        <p className="text-sm text-muted-foreground">
          Write a prescription during or after a consultation (from the Appointments page).
        </p>
      </div>
      {appointmentId && !canWrite && (
        <p className="rounded-lg border p-3 text-sm text-muted-foreground">
          This appointment can&apos;t get a new prescription: it isn&apos;t started or completed yet, or it already has one.
        </p>
      )}
      {canWrite && <PrescriptionForm appointmentId={target.id} patientName={target.patient?.name} />}
      <PrescriptionList prescriptions={prescriptions.data} viewer="DOCTOR" />
    </div>
  );
};

export default DoctorPrescriptionsPage;
