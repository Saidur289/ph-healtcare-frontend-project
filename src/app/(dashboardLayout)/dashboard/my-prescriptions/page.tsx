import PrescriptionList from "@/components/modules/Shared/PrescriptionList";
import { getMyPrescriptions } from "@/services/consultation.services";

const MyPrescriptionsPage = async () => {
  const prescriptions = await getMyPrescriptions();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My Prescriptions</h1>
        <p className="text-sm text-muted-foreground">Prescriptions from your consultations, with PDF download.</p>
      </div>
      <PrescriptionList prescriptions={prescriptions.data} viewer="PATIENT" />
    </div>
  );
};

export default MyPrescriptionsPage;
