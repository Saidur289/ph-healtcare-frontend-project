"use client";
import { saveHealthDataAction, THealthFormValues } from "@/app/_actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BLOOD_GROUPS, bloodGroupLabel, IHealthData } from "@/types/profile.types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

const FLAGS: { key: keyof THealthFormValues; label: string }[] = [
  { key: "hasAllergies", label: "Allergies" },
  { key: "hasDiabetes", label: "Diabetes" },
  { key: "smokingStatus", label: "Smoker" },
  { key: "hasPastSurgeries", label: "Past surgeries" },
  { key: "pregnancyStatus", label: "Pregnant" },
  { key: "recentAnxiety", label: "Recent anxiety" },
  { key: "recentDepression", label: "Recent depression" },
];

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

const toForm = (data?: IHealthData | null): THealthFormValues => ({
  gender: data?.gender ?? ("" as "MALE"),
  dateOfBirth: data?.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
  bloodGroup: data?.bloodGroup ?? ("" as "A_POSITIVE"),
  height: data?.height ?? "",
  weight: data?.weight ?? "",
  hasAllergies: data?.hasAllergies ?? false,
  hasDiabetes: data?.hasDiabetes ?? false,
  smokingStatus: data?.smokingStatus ?? false,
  pregnancyStatus: data?.pregnancyStatus ?? false,
  hasPastSurgeries: data?.hasPastSurgeries ?? false,
  recentAnxiety: data?.recentAnxiety ?? false,
  recentDepression: data?.recentDepression ?? false,
  dietaryPreferences: data?.dietaryPreferences ?? "",
  mentalHealthHistory: data?.mentalHealthHistory ?? "",
  immunizationStatus: data?.immunizationStatus ?? "",
  maritalStatus: data?.maritalStatus ?? "",
});

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={`${id}-error`} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;

const HealthDataForm = ({ data }: { data?: IHealthData | null }) => {
  const router = useRouter();
  const [values, setValues] = useState<THealthFormValues>(() => toForm(data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof THealthFormValues>(key: K, value: THealthFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const invalid = (key: string) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveHealthDataAction(values);
      setErrors(result.fieldErrors ?? {});
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <select id="gender" className={selectClass} value={values.gender} onChange={(e) => set("gender", e.target.value as "MALE")} {...invalid("gender")}>
            <option value="" disabled>
              Choose…
            </option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
          </select>
          <FieldError id="gender" message={errors.gender} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input id="dateOfBirth" type="date" value={values.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} {...invalid("dateOfBirth")} />
          <FieldError id="dateOfBirth" message={errors.dateOfBirth} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup">Blood group</Label>
          <select id="bloodGroup" className={selectClass} value={values.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value as "A_POSITIVE")} {...invalid("bloodGroup")}>
            <option value="" disabled>
              Choose…
            </option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {bloodGroupLabel(group)}
              </option>
            ))}
          </select>
          <FieldError id="bloodGroup" message={errors.bloodGroup} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="height">Height</Label>
          <Input id="height" placeholder="170 cm" maxLength={20} value={values.height} onChange={(e) => set("height", e.target.value)} {...invalid("height")} />
          <FieldError id="height" message={errors.height} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight</Label>
          <Input id="weight" placeholder="65 kg" maxLength={20} value={values.weight} onChange={(e) => set("weight", e.target.value)} {...invalid("weight")} />
          <FieldError id="weight" message={errors.weight} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maritalStatus">Marital status</Label>
          <Input id="maritalStatus" maxLength={30} value={values.maritalStatus ?? ""} onChange={(e) => set("maritalStatus", e.target.value)} {...invalid("maritalStatus")} />
          <FieldError id="maritalStatus" message={errors.maritalStatus} />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Conditions</legend>
        <div className="flex flex-wrap gap-2">
          {FLAGS.map(({ key, label }) => {
            const on = Boolean(values[key]);
            return (
              <button
                key={key}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => set(key, !on as never)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(
          [
            ["dietaryPreferences", "Diet", 500],
            ["immunizationStatus", "Vaccinations", 500],
            ["mentalHealthHistory", "Mental health history", 1000],
          ] as const
        ).map(([key, label, max]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{label}</Label>
            <Textarea id={key} rows={3} maxLength={max} value={values[key] ?? ""} onChange={(e) => set(key, e.target.value)} {...invalid(key)} />
            <FieldError id={key} message={errors[key]} />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "Saving..." : "Save health information"}
        </Button>
      </div>
    </form>
  );
};

export default HealthDataForm;
