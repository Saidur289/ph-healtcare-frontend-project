import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IPrescription } from "@/types/consultation.types";
import { format } from "date-fns";
import { Download } from "lucide-react";

// Used by the doctor (shows the patient) and the patient (shows the doctor).
const PrescriptionList = ({
  prescriptions,
  viewer,
}: {
  prescriptions: IPrescription[];
  viewer: "DOCTOR" | "PATIENT";
}) => {
  if (prescriptions.length === 0) {
    return <p className="text-sm text-muted-foreground">No prescriptions yet.</p>;
  }
  return (
    <div className="space-y-3">
      {prescriptions.map((p) => (
        <Card key={p.id}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                {viewer === "DOCTOR" ? p.patient?.name : `Dr. ${p.doctor?.name ?? ""}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Issued {format(new Date(p.createdAt), "MMM d, yyyy")} · Follow-up{" "}
                {format(new Date(p.followUpDate), "MMM d, yyyy")}
              </p>
            </div>
            {p.pdfUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-1 h-4 w-4" /> PDF
                </a>
              </Button>
            ) : (
              <Badge variant="secondary">PDF is being prepared</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              {(p.medicines ?? []).map((m, i) => (
                <li key={`${p.id}-${i}`}>
                  <span className="font-medium">{m.name}</span> — {m.dose}, {m.frequency}, {m.duration}
                  {m.notes ? <span className="text-muted-foreground"> ({m.notes})</span> : null}
                </li>
              ))}
            </ul>
            <p className="whitespace-pre-line text-muted-foreground">{p.instructions}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrescriptionList;
