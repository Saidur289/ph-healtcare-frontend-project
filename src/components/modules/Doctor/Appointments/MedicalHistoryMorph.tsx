"use client";
// "Medical history" button that grows into the patient's history panel (MorphDialog). The data is
// fetched only when opened: each opening is one audited read on the API.
import { getMedicalHistoryAction } from "@/app/_actions/appointment.actions";
import { MorphDialog } from "@/components/motion/MorphDialog";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { bloodGroupLabel } from "@/types/profile.types";
import { useQuery } from "@tanstack/react-query";
import { differenceInYears, format } from "date-fns";
import { Check, ClipboardList, FileText, Loader2, Minus, ShieldCheck } from "lucide-react";
import { useState } from "react";

const CONDITIONS = [
  ["hasAllergies", "Allergies"],
  ["hasDiabetes", "Diabetes"],
  ["smokingStatus", "Smokes"],
  ["hasPastSurgeries", "Past surgeries"],
  ["pregnancyStatus", "Pregnant"],
  ["recentAnxiety", "Recent anxiety"],
  ["recentDepression", "Recent depression"],
] as const;

const MedicalHistoryMorph = ({ appointmentId, patientName }: { appointmentId: string; patientName?: string }) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["medical-history", appointmentId],
    queryFn: async () => {
      const result = await getMedicalHistoryAction(appointmentId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: open,
    // never kept around: health data is read fresh (and audited) each time it is opened
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  const health = data?.healthData;
  const birth = health ? new Date(health.dateOfBirth) : null;
  const age = birth && !Number.isNaN(birth.getTime()) ? differenceInYears(new Date(), birth) : null;

  return (
    <MorphDialog
      layoutId={`medical-history-${appointmentId}`}
      open={open}
      onOpenChange={setOpen}
      className="max-w-2xl"
      trigger={
        <Button size="sm" variant="outline">
          <ClipboardList className="h-4 w-4" aria-hidden /> Medical history
        </Button>
      }
    >
      <div className="space-y-1.5 border-b px-6 py-5 pr-14">
        <DialogTitle className="text-lg font-semibold">Medical history</DialogTitle>
        <DialogDescription className="flex items-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {patientName ?? data?.patient.name ?? "Patient"} · shared for this consultation; your access is recorded.
        </DialogDescription>
      </div>

      <ScrollArea className="max-h-[calc(90vh-7rem)]">
        <div className="space-y-5 px-6 py-5">
          {isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading the medical history...
            </p>
          )}
          {isError && <p className="text-sm text-destructive">The medical history could not be loaded.</p>}

          {data && !health && <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">The patient has not filled in their health information yet.</p>}

          {health && (
            <Stagger className="space-y-5">
              <StaggerItem as="section" aria-label="Vitals">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Blood group", bloodGroupLabel(health.bloodGroup)],
                    ["Height", health.height],
                    ["Weight", health.weight],
                    ["Age", age === null ? "—" : `${age} yrs · ${health.gender === "FEMALE" ? "F" : "M"}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border bg-card/60 p-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-base font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </StaggerItem>

              <StaggerItem as="section" aria-label="Conditions">
                <h3 className="mb-2 text-sm font-semibold">Conditions</h3>
                <ul className="flex flex-wrap gap-2">
                  {CONDITIONS.map(([key, label]) => {
                    const yes = health[key];
                    return (
                      <li
                        key={key}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                          yes ? "border-warning/40 bg-warning-soft text-warning" : "text-muted-foreground",
                        )}
                      >
                        {yes ? <Check className="h-3 w-3" aria-hidden /> : <Minus className="h-3 w-3" aria-hidden />}
                        {label}: {yes ? "yes" : "no"}
                      </li>
                    );
                  })}
                </ul>
              </StaggerItem>

              {(health.mentalHealthHistory || health.dietaryPreferences || health.immunizationStatus) && (
                <StaggerItem as="section" aria-label="Notes">
                  <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                  <dl className="space-y-2 text-sm">
                    {[
                      ["Mental health history", health.mentalHealthHistory],
                      ["Diet", health.dietaryPreferences],
                      ["Immunizations", health.immunizationStatus],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div key={label} className="grid gap-0.5 sm:grid-cols-[10rem_1fr]">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                  </dl>
                </StaggerItem>
              )}
            </Stagger>
          )}

          {data && (
            <section aria-label="Reports">
              <h3 className="mb-2 text-sm font-semibold">Reports</h3>
              {data.reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports uploaded.</p>
              ) : (
                <Stagger as="ul" className="divide-y rounded-xl border">
                  {data.reports.map((report) => (
                    <StaggerItem as="li" key={report.id} className="flex items-center gap-3 p-3 text-sm">
                      <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{report.reportName}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(report.createdAt), "dd MMM yyyy")}</span>
                      {report.hasFile && (
                        <Button asChild size="sm" variant="ghost">
                          <a href={`/files/reports/${report.id}`} target="_blank" rel="noopener noreferrer">
                            Open
                          </a>
                        </Button>
                      )}
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </section>
          )}
        </div>
      </ScrollArea>
    </MorphDialog>
  );
};

export default MedicalHistoryMorph;
