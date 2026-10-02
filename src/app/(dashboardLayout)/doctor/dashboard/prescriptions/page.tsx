import PrescriptionForm from "@/components/modules/Doctor/Prescriptions/PrescriptionForm";
import PrescriptionList from "@/components/modules/Shared/PrescriptionList";
import ErrorState from "@/components/shared/ErrorState";
import { getMyAppointments } from "@/services/appointment.services";
import { getMyPrescriptions } from "@/services/consultation.services";

// ?appointmentId=... opens the form for that appointment (from the call or the appointments list)
const DoctorPrescriptionsPage = async ({ searchParams }: { searchParams: Promise<{ appointmentId?: string }> }) => {
  const { appointmentId } = await searchParams;
  const [prescriptions, appointments] = await Promise.all([
    getMyPrescriptions().catch(() => null),
    appointmentId ? getMyAppointments().catch(() => null) : Promise.resolve(null),
  ]);
  const target = appointmentId ? appointments?.data?.find((a) => a.id === appointmentId) : undefined;
  const canWrite = target && (target.status === "INPROGRESS" || target.status === "COMPLETED") && !target.prescription;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Prescriptions</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Write a prescription during or after a consultation (from the Appointments page).
        </p>
      </div>
      {appointmentId && !canWrite && (
        <p className="rounded-lg border bg-card p-3 text-[13px] text-muted-foreground">
          This appointment can&apos;t get a new prescription: it isn&apos;t started or completed yet, or it already has one.
        </p>
      )}
      {canWrite && <PrescriptionForm appointmentId={target.id} patientName={target.patient?.name} />}
      {prescriptions ? (
        <PrescriptionList prescriptions={prescriptions.data ?? []} viewer="DOCTOR" />
      ) : (
        <ErrorState message="Could not load your prescriptions." />
      )}
    </div>
  );
};

export default DoctorPrescriptionsPage;
