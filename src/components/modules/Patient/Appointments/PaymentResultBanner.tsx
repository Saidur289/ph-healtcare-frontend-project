"use client";
import { getAppointmentPaymentStatusAction } from "@/app/_actions/appointment.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TState = "checking" | "paid" | "refunded" | "slow" | "cancelled";

const POLL_EVERY_MS = 2000;
const GIVE_UP_AFTER_MS = 30000;

// Stripe sends the patient back before (or right after) its webhook reaches our API,
// so on "success" we poll the appointment until the API confirms the payment.
const PaymentResultBanner = ({
  payment,
  appointmentId,
}: {
  payment?: string;
  appointmentId?: string;
}) => {
  const router = useRouter();
  const [state, setState] = useState<TState>(
    payment === "cancelled" ? "cancelled" : "checking",
  );

  useEffect(() => {
    if (payment !== "success" || !appointmentId) return;
    let stopped = false;
    const startedAt = Date.now();

    const poll = async () => {
      const result = await getAppointmentPaymentStatusAction(appointmentId);
      if (stopped) return;
      if (result.success && result.paymentStatus === "PAID") {
        setState("paid");
        router.refresh(); // reload the list below with the new status
        return;
      }
      if (result.success && result.paymentStatus === "REFUNDED") {
        setState("refunded");
        router.refresh();
        return;
      }
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        setState("slow");
        return;
      }
      setTimeout(poll, POLL_EVERY_MS);
    };
    void poll();
    return () => {
      stopped = true;
    };
  }, [payment, appointmentId, router]);

  if (payment !== "success" && payment !== "cancelled") return null;

  if (state === "cancelled") {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Payment cancelled</AlertTitle>
        <AlertDescription>
          No money was taken. Your appointment is kept until its payment deadline - you can pay
          with the &quot;Pay Now&quot; button below.
        </AlertDescription>
      </Alert>
    );
  }
  if (state === "paid") {
    return (
      <Alert className="mb-4 border-green-600/40 text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription>
          Your appointment is confirmed. The invoice will arrive by email in a few minutes.
        </AlertDescription>
      </Alert>
    );
  }
  if (state === "refunded") {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Payment refunded</AlertTitle>
        <AlertDescription>
          The payment arrived after the booking had expired, so it was refunded automatically.
          Please book a new time slot.
        </AlertDescription>
      </Alert>
    );
  }
  if (state === "slow") {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4" />
        <AlertTitle>Payment is being confirmed</AlertTitle>
        <AlertDescription>
          This is taking longer than usual. Refresh this page in a minute - if Stripe charged you,
          the appointment will show as paid.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="mb-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertTitle>Confirming your payment...</AlertTitle>
      <AlertDescription>Please wait a few seconds.</AlertDescription>
    </Alert>
  );
};

export default PaymentResultBanner;
