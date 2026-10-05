"use client";
import { getAppointmentPaymentStatusAction } from "@/app/_actions/appointment.actions";
import { FloatingAlert } from "@/components/motion/FloatingAlert";
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
  const [dismissed, setDismissed] = useState(false);

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

  const view: Record<TState, { tone: "info" | "success" | "danger"; icon: typeof Loader2; spin?: boolean; title: string; text: string }> = {
    cancelled: {
      tone: "danger",
      icon: XCircle,
      title: "Payment cancelled",
      text: "No money was taken. Your appointment is kept until its payment deadline - you can pay with the \"Pay Now\" button below.",
    },
    paid: {
      tone: "success",
      icon: CheckCircle2,
      title: "Payment successful",
      text: "Your appointment is confirmed. The invoice will arrive by email in a few minutes.",
    },
    refunded: {
      tone: "danger",
      icon: XCircle,
      title: "Payment refunded",
      text: "The payment arrived after the booking had expired, so it was refunded automatically. Please book a new time slot.",
    },
    slow: {
      tone: "info",
      icon: Loader2,
      title: "Payment is being confirmed",
      text: "This is taking longer than usual. Refresh this page in a minute - if Stripe charged you, the appointment will show as paid.",
    },
    checking: { tone: "info", icon: Loader2, spin: true, title: "Confirming your payment...", text: "Please wait a few seconds." },
  };
  const current = view[state];

  // a floating card at the screen edge; it morphs from "confirming" to the result and can be swiped away
  return (
    <FloatingAlert
      show={!dismissed}
      onDismiss={() => setDismissed(true)}
      tone={current.tone}
      icon={current.icon}
      iconClassName={current.spin ? "animate-spin" : undefined}
      title={current.title}
      contentKey={state}
    >
      {current.text}
    </FloatingAlert>
  );
};

export default PaymentResultBanner;
