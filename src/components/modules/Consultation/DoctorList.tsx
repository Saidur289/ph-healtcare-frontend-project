"use client";

import { getDoctors } from "@/app/(commonLayout)/consultation/_action";
import { useQuery } from "@tanstack/react-query";

const DoctorList = () => {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
  });
  return (
    <div>
      DoctorList
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};

export default DoctorList;
