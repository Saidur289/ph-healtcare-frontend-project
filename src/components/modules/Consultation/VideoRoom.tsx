"use client";
import { completeAppointmentAction } from "@/app/_actions/consultation.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IAppointment } from "@/types/appointment.types";
import { IJoinCallResult } from "@/types/consultation.types";
import { format } from "date-fns";
import { Camera, CheckCircle2, Clock, FileText, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useNow } from "@/hooks/useNow";
import { toast } from "sonner";

const OPENS_BEFORE_MIN = 10; // same rule as the API

const formatTime = (value?: string | Date) =>
  value ? format(new Date(value), "EEE, MMM d • hh:mm a") : "N/A";

// Local camera + microphone preview, so people can fix permissions before the call opens.
const DeviceCheck = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState("ok");
    } catch {
      setState("error");
    }
  };
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return (
    <div className="space-y-2">
      <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-lg bg-black" />
      {state === "error" && (
        <p className="text-sm text-destructive">
          Camera or microphone is blocked. Allow access in your browser&apos;s address bar and try again.
        </p>
      )}
      {state === "ok" ? (
        <p className="flex items-center gap-1 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Camera and microphone work.
        </p>
      ) : (
        <Button type="button" variant="outline" onClick={start}>
          <Camera className="mr-2 h-4 w-4" /> Check camera &amp; microphone
        </Button>
      )}
    </div>
  );
};

const Countdown = ({ until, onDone }: { until: number; onDone: () => void }) => {
  const [left, setLeft] = useState(() => until - Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = until - Date.now();
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onDone();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [until, onDone]);
  if (left <= 0) return <span>now</span>;
  const total = Math.floor(left / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return <span className="font-mono">{h > 0 ? `${h}h ` : ""}{m}m {String(s).padStart(2, "0")}s</span>;
};

const VideoRoom = ({
  appointment,
  role,
  join,
  joinError,
}: {
  appointment: IAppointment;
  role: string;
  join: IJoinCallResult | null;
  joinError: string | null;
}) => {
  const router = useRouter();
  const [isCompleting, startCompleting] = useTransition();
  const now = useNow();
  const isDoctor = role === "DOCTOR";
  const other = isDoctor ? appointment.patient?.name : `Dr. ${appointment.doctor?.name ?? ""}`;
  const start = appointment.schedule?.startDateTime ? new Date(appointment.schedule.startDateTime).getTime() : 0;
  const opensAt = start - OPENS_BEFORE_MIN * 60 * 1000;
  const backHref = isDoctor ? "/doctor/dashboard/appointments" : "/dashboard/my-appointments";

  const complete = () =>
    startCompleting(async () => {
      const result = await completeAppointmentAction(appointment.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`);
    });

  // ---------- in the call ----------
  if (join) {
    return (
      <section className="mx-auto max-w-6xl space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Consultation with {other}</h1>
            <p className="text-sm text-muted-foreground">
              {formatTime(join.slotStart)} - {format(new Date(join.slotEnd), "hh:mm a")}
            </p>
          </div>
          <div className="flex gap-2">
            {isDoctor && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/doctor/dashboard/prescriptions?appointmentId=${appointment.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> Write prescription
                  </Link>
                </Button>
                <Button onClick={complete} disabled={isCompleting}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isCompleting ? "Completing..." : "Complete consultation"}
                </Button>
              </>
            )}
            <Button asChild variant="ghost">
              <Link href={backHref}>Leave</Link>
            </Button>
          </div>
        </div>
        {/* Daily Prebuilt: includes its own camera/mic check before entering */}
        <iframe
          title="Video consultation"
          src={`${join.roomUrl}?t=${encodeURIComponent(join.token)}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="h-[75vh] w-full rounded-xl border"
        />
      </section>
    );
  }

  // ---------- waiting room / not available ----------
  const isBeforeWindow = now > 0 && now < opensAt && appointment.paymentStatus === "PAID";
  return (
    <section className="mx-auto max-w-xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" /> Consultation with {other}
          </CardTitle>
          <CardDescription>{formatTime(appointment.schedule?.startDateTime)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBeforeWindow ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Waiting room</AlertTitle>
              <AlertDescription>
                The call opens {OPENS_BEFORE_MIN} minutes before the appointment, in{" "}
                <Countdown until={opensAt} onDone={() => router.refresh()} />. This page opens the
                call automatically.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>The call is not available</AlertTitle>
              <AlertDescription>{joinError}</AlertDescription>
            </Alert>
          )}
          <DeviceCheck />
          <Button asChild variant="ghost" className="w-full">
            <Link href={backHref}>Back to appointments</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default VideoRoom;
