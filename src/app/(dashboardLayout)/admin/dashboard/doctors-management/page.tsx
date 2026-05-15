import DoctorTable from "@/components/modules/Admin/DoctorManagement/DoctorTable";
import { getAllSpecialties, getDoctors } from "@/services/doctor.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const DoctorsManagementsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) => {
  const queryClient = new QueryClient();
  const queryParamsObjects = await searchParams;
  /*
  {
  searchTerm: "cardio",
  page: "1",
  limit: "10",
  gender: "MALE",
  "appointFee[gt]": "500",
}
  */
  // ?searchTerm=cardio&page=1&limit=10&gender=MALE&appointFee[gt]=500

  // const queryString = Object.keys(queryParamsObjects).map((key) => `${key}=${queryParamsObjects[key]}`).join("&");

  //if the value is an array, we need to convert it to multiple query params with the same key
  const queryString = Object.keys(queryParamsObjects)
    .map((key) => {
      const value = queryParamsObjects[key];
      if (value === undefined) {
        return "";
      }

      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join("&");
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join("&");
  await queryClient.prefetchQuery({
    queryKey: ["doctors", queryString],
    queryFn: () => getDoctors(queryString),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
  await queryClient.prefetchQuery({
    queryKey: ["specialties"],
    queryFn: () => getAllSpecialties(),
    staleTime: 60 * 60 * 1000 * 6, // 6 hour
    gcTime: 1000 * 60 * 60 * 24, // 1 days
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorTable initialQueryString={queryString} />
    </HydrationBoundary>
  );
};

export default DoctorsManagementsPage;
