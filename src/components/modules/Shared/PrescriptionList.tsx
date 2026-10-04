import EmptyState from "@/components/shared/EmptyState";
import StatusPill from "@/components/shared/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/userDisplay";
import { IPrescription } from "@/types/consultation.types";
import { format } from "date-fns";
import { CalendarClock, Download, FileText } from "lucide-react";

// Used by the doctor (shows the patient) and the patient (shows the doctor).
const PrescriptionList = ({ prescriptions, viewer }: { prescriptions: IPrescription[]; viewer: "DOCTOR" | "PATIENT" }) => {
  if (prescriptions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No prescriptions yet"
        description={
          viewer === "DOCTOR"
            ? "Write one from an appointment that has started or finished."
            : "Your doctor's prescriptions appear here after the consultation."
        }
      />
    );
  }
  return (
    <ul className="space-y-3">
      {prescriptions.map((p) => {
        const name = viewer === "DOCTOR" ? p.patient?.name ?? "Patient" : `Dr. ${p.doctor?.name ?? ""}`;
        return (
          <li key={p.id} className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                  {initials(viewer === "DOCTOR" ? p.patient?.name : p.doctor?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span>Issued {format(new Date(p.createdAt), "dd MMM yyyy")}</span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Follow-up {format(new Date(p.followUpDate), "dd MMM yyyy")}
                  </span>
                </p>
              </div>
              {p.pdfUrl ? (
                <Button asChild size="sm" variant="outline">
                  <a href={`/files/prescriptions/${p.id}`} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" aria-hidden /> PDF
                  </a>
                </Button>
              ) : (
                <StatusPill tone="amber">PDF is being prepared</StatusPill>
              )}
            </div>

            {(p.medicines ?? []).length > 0 && (
              <div className="mt-3 overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-muted/60 text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Medicine</th>
                      <th scope="col" className="px-3 py-2 font-medium">Dose</th>
                      <th scope="col" className="px-3 py-2 font-medium">How often</th>
                      <th scope="col" className="px-3 py-2 font-medium">For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(p.medicines ?? []).map((m, i) => (
                      <tr key={`${p.id}-${i}`}>
                        <td className="px-3 py-2">
                          <span className="font-medium">{m.name}</span>
                          {m.notes && <span className="block text-xs text-muted-foreground">{m.notes}</span>}
                        </td>
                        <td className="px-3 py-2">{m.dose}</td>
                        <td className="px-3 py-2">{m.frequency}</td>
                        <td className="px-3 py-2">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {p.instructions && <p className="mt-3 whitespace-pre-line text-[13px] text-muted-foreground">{p.instructions}</p>}
          </li>
        );
      })}
    </ul>
  );
};

export default PrescriptionList;
