import HealthDataForm from "@/components/modules/Patient/HealthRecords/HealthDataForm";
import MedicalReports from "@/components/modules/Patient/HealthRecords/MedicalReports";
import VitalsSummary from "@/components/modules/Patient/HealthRecords/VitalsSummary";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import ErrorState from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/card";
import { getMyProfile } from "@/services/profile.services";
import { format } from "date-fns";

const HealthRecordsPage = async () => {
  const response = await getMyProfile().catch(() => null);
  const profile = response?.data?.profile;
  if (!profile) return <ErrorState message="Could not load your health records." />;
  const health = profile.patientHealthData;

  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Health Records</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Keep your health details and test reports in one place.
          {health?.updatedAt ? ` Last updated ${format(new Date(health.updatedAt), "dd MMM yyyy")}.` : ""}
        </p>
      </StaggerItem>

      {health && (
        <StaggerItem>
          <VitalsSummary health={health} />
        </StaggerItem>
      )}

      <StaggerItem>
        <Card className="gap-4 p-5 shadow-xs">
          <h2 className="text-[15px] font-semibold">Health information</h2>
          {!health && (
            <p className="rounded-lg bg-info-soft px-3 py-2 text-[13px] text-primary">
              Fill in gender, date of birth, blood group, height and weight to create your record.
            </p>
          )}
          <HealthDataForm data={health} />
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="gap-4 p-5 shadow-xs">
          <h2 className="text-[15px] font-semibold">Medical reports</h2>
          <MedicalReports reports={profile.medicalReports ?? []} />
        </Card>
      </StaggerItem>
    </Stagger>
  );
};

export default HealthRecordsPage;
