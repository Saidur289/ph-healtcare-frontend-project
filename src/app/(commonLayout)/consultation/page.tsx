import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getDoctors } from "./_action";
import DoctorList from "@/components/modules/Consultation/DoctorList";

const ConsultationPage = () => {
  const queryClient = new QueryClient();
  queryClient.prefetchQuery({
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
