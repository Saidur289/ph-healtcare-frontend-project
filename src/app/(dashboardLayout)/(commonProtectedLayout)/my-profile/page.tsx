import PrivacyCard from "@/components/modules/Profile/PrivacyCard";
import ProfileForm from "@/components/modules/Profile/ProfileForm";
import ErrorState from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/card";
import { formatTaka } from "@/lib/appointmentUtils";
import { roleLabel } from "@/lib/userDisplay";
import { getMyProfile } from "@/services/profile.services";
import { format } from "date-fns";
import { Star } from "lucide-react";

const MyProfilePage = async () => {
  const response = await getMyProfile().catch(() => null);
  const data = response?.data;
  if (!data) return <ErrorState message="Could not load your profile." />;
  const doctor = data.role === "DOCTOR" ? data.profile : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">My Profile</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {roleLabel(data.role)} · member since {format(new Date(data.createdAt), "MMMM yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 shadow-xs xl:col-span-2">
          <ProfileForm data={data} />
        </Card>

        {data.role === "PATIENT" && (
          <div className="h-fit">
            <PrivacyCard hasPassword={data.hasPassword !== false} />
          </div>
        )}

        {doctor && (
          <Card className="h-fit gap-3 p-5 shadow-xs">
            <p className="text-[15px] font-semibold">Practice details</p>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Consultation fee</dt>
                <dd className="font-medium">{formatTaka(doctor.appointmentFee)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Registration no.</dt>
                <dd className="font-medium">{doctor.registrationNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  {(doctor.averageRating ?? 0).toFixed(1)} ({doctor.reviewCount ?? 0})
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Specialties</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(doctor.specialties ?? []).length === 0
                    ? "—"
                    : doctor.specialties!.map((s) => (
                        <span key={s.specialty.id} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                          {s.specialty.title}
                        </span>
                      ))}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">The fee and registration number are changed by an admin.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
