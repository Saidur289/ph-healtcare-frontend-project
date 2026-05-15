import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import DoctorList from "@/components/modules/Consultation/DoctorList";
import { getDoctors } from "@/services/doctor.services";

const ConsultationPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorList />
    </HydrationBoundary>
  );
};

export default ConsultationPage;
