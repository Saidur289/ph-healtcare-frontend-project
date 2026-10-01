"use client";
import { createPrescriptionAction } from "@/app/_actions/consultation.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IMedicine } from "@/types/consultation.types";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const emptyMedicine = (): IMedicine => ({ name: "", dose: "", frequency: "", duration: "", notes: "" });

const PrescriptionForm = ({
  appointmentId,
  patientName,
}: {
  appointmentId: string;
  patientName?: string;
}) => {
  const router = useRouter();
  const [medicines, setMedicines] = useState<IMedicine[]>([emptyMedicine()]);
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (index: number, field: keyof IMedicine, value: string) =>
    setMedicines((list) => list.map((m, i) => (i === index ? { ...m, [field]: value } : m)));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPrescriptionAction({ appointmentId, followUpDate, instructions, medicines });
      if (!result.success) return setError(result.message);
      toast.success(result.message);
      // replace() alone re-renders the server page (new search params); adding refresh()
      // in the same transition left the button stuck on "Saving..."
      router.replace("/doctor/dashboard/prescriptions");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New prescription</CardTitle>
        <CardDescription>For {patientName ?? "this appointment"}. The patient gets the PDF by email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Medicines</Label>
            {medicines.map((medicine, index) => (
              <div key={index} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1.5fr_1fr_auto]">
                <Input aria-label="Medicine name" placeholder="Medicine (e.g. Paracetamol)" value={medicine.name} onChange={(e) => update(index, "name", e.target.value)} />
                <Input aria-label="Dose" placeholder="Dose (500 mg)" value={medicine.dose} onChange={(e) => update(index, "dose", e.target.value)} />
                <Input aria-label="Frequency" placeholder="Frequency (1+0+1)" value={medicine.frequency} onChange={(e) => update(index, "frequency", e.target.value)} />
                <Input aria-label="Duration" placeholder="Duration (7 days)" value={medicine.duration} onChange={(e) => update(index, "duration", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove medicine" disabled={medicines.length === 1} onClick={() => setMedicines((list) => list.filter((_, i) => i !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Input aria-label="Notes" className="md:col-span-5" placeholder="Notes (optional)" value={medicine.notes ?? ""} onChange={(e) => update(index, "notes", e.target.value)} />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" disabled={medicines.length >= 30} onClick={() => setMedicines((list) => [...list, emptyMedicine()])}>
              <Plus className="mr-1 h-4 w-4" /> Add medicine
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" rows={4} maxLength={5000} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Advice, tests, diet..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="followUp">Follow-up date</Label>
            <Input id="followUp" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Saving..." : "Save prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;
