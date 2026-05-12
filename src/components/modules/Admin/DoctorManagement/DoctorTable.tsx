"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDoctors } from "@/services/doctor.service";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

/* export interface IDoctors {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
}*/
const DoctorTable = () => {
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    refetchOnWindowFocus: "always",
  });
  const { data } = doctorsData! || [];
  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "specialization", header: "Specialization" },
    { accessorKey: "experience", header: "Experience" },
    { accessorKey: "rating", header: "Rating" },
  ];
  const { getHeaderGroups, getRowModel } = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <Table>
      <TableHeader>
        {getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DoctorTable;
