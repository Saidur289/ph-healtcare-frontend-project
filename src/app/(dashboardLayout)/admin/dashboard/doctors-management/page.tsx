import DoctorTable from "@/components/modules/Admin/DoctorManagement/DoctorTable";
import { getDoctors } from "@/services/doctor.service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const DoctorsManagementsPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorTable />
    </HydrationBoundary>
  );
};

export default DoctorsManagementsPage;
