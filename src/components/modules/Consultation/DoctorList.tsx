"use client";

import { getDoctors } from "@/services/doctor.services";
import { useQuery } from "@tanstack/react-query";

const DoctorList = () => {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
  return (
    <div>
      DoctorList
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};

export default DoctorList;
