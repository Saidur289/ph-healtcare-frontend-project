"use client";
import DataTable from "@/components/shared/table/DataTable";
import { getDoctors } from "@/services/doctor.service";
import { useQuery } from "@tanstack/react-query";
import { doctorColumn } from "./doctorsColumns";

const DoctorTable = () => {
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    refetchOnWindowFocus: "always",
  });
  const { data } = doctorsData! || [];

  const handleView = () => {
    console.log("view");
  };
  const handleEdit = () => {
    console.log("edit");
  };
  const handleDelete = () => {
    console.log("delete");
  };
  return (
    <DataTable
      data={data}
      columns={doctorColumn}
      actions={{
        viewData: handleView,
        editData: handleEdit,
        deleteData: handleDelete,
      }}
      emptyMessage="No doctors found"
    />
  );
};

export default DoctorTable;
