import PrescriptionList from "@/components/modules/Shared/PrescriptionList";
import ErrorState from "@/components/shared/ErrorState";
import { getMyPrescriptions } from "@/services/consultation.services";

const MyPrescriptionsPage = async () => {
  const prescriptions = await getMyPrescriptions().catch(() => null);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">My Prescriptions</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Prescriptions from your consultations, with PDF download.</p>
      </div>
      {prescriptions ? (
        <PrescriptionList prescriptions={prescriptions.data ?? []} viewer="PATIENT" />
      ) : (
        <ErrorState message="Could not load your prescriptions." />
      )}
    </div>
  );
};

export default MyPrescriptionsPage;
