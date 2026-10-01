import VideoRoom from "@/components/modules/Consultation/VideoRoom";
import { getDefaultDashboardRoute, UserRole } from "@/lib/authUtils";
import { getMySingleAppointment } from "@/services/appointment.services";
import { getUserInfo } from "@/services/auth.service";
import { getJoinDetails } from "@/services/consultation.services";
import { IAppointment } from "@/types/appointment.types";
import { IJoinCallResult } from "@/types/consultation.types";
import { notFound, redirect, unstable_rethrow } from "next/navigation";

const apiMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : "The call is not available right now";
};

// Video consultation for ONE appointment. Only its patient and doctor get join details;
// the API decides (paid, status, time window) and returns a short-lived Daily.co token.
const ConsultationRoomPage = async ({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) => {
  const { appointmentId } = await params;
  const user = await getUserInfo();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/consultation/room/${appointmentId}`)}`);
  }
  if (user.role !== "PATIENT" && user.role !== "DOCTOR") {
    redirect(getDefaultDashboardRoute(user.role as UserRole));
  }

  let appointment: IAppointment | null = null;
  try {
    appointment = (await getMySingleAppointment(appointmentId)).data;
  } catch (error) {
    unstable_rethrow(error);
  }
  if (!appointment) notFound();

  let join: IJoinCallResult | null = null;
  let joinError: string | null = null;
  try {
    join = (await getJoinDetails(appointmentId)).data;
  } catch (error) {
    unstable_rethrow(error);
    joinError = apiMessage(error);
  }

  return (
    <VideoRoom
      appointment={appointment}
      role={user.role}
      join={join}
      joinError={joinError}
    />
  );
};

export default ConsultationRoomPage;
