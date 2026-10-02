"use client";
import { doctorCancelAppointmentAction } from "@/app/_actions/consultation.actions";
import { cancelAppointmentAction } from "@/app/_actions/patientAppointment.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IAppointment } from "@/types/appointment.types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

// used by patients (until 2 h before) and doctors (any time before the visit)
const CancelAppointmentDialog = ({ appointment, who = "patient" }: { appointment: IAppointment; who?: "patient" | "doctor" }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const paid = appointment.paymentStatus === "PAID";

  const confirm = () =>
    startTransition(async () => {
      const cancel = who === "doctor" ? doctorCancelAppointmentAction : cancelAppointmentAction;
      const result = await cancel(appointment.id, reason || undefined);
      if (!result.success) return void toast.error(result.message);
      toast.success(paid && who === "patient" ? `${result.message}. Your refund is on its way.` : result.message);
      setOpen(false);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription>
            {who === "doctor"
              ? paid
                ? "The patient is refunded automatically and sees the cancellation in their appointments."
                : "The patient sees the cancellation in their appointments."
              : paid
                ? "Your payment will be refunded to the same card. Refunds usually arrive in 5–10 days."
                : "The time slot will be released for other patients."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`reason-${appointment.id}`}>Reason (optional)</Label>
          <Textarea
            id={`reason-${appointment.id}`}
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={who === "doctor" ? "Tell the patient why" : "Let the doctor know why"}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Keep appointment
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {pending ? "Cancelling..." : "Cancel appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentDialog;
