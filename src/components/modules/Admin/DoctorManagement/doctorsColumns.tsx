import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import { IDoctors } from "@/types/doctor.types";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

export const doctorColumn: ColumnDef<IDoctors>[] = [
  //id or accessory is same as the key in the data object
  {
    id: "name",
    accessorKey: "name",
    header: "Doctor",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.name}
        email={row.original.email}
        profilePhoto={row.original.profilePhoto}
      />
    ),
  },
  {
    id: "specialties",
    accessorKey: "specialties",
    header: "Specialties",
    cell: ({ row }) => {
      const specialties = row.original.specialties;

      if (!specialties || specialties.length === 0) {
        return (
          <span className="text-muted-foreground text-xs">No specialties</span>
        );
      }
      return (
        <div>
          {specialties.map(({ specialty }, id) => {
            return (
              <Badge variant={"secondary"} key={id}>
                {specialty.title || "N/A"}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.original.contactNumber || "N/A"}</span>
      </div>
    ),
  },
  {
    id: "experience",
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.experience || "N/A"} years
      </span>
    ),
  },
  {
    id: "appointmentFee",
    accessorKey: "appointmentFee",
    header: "Appointment Fee",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-green-600">
        {row.original.appointmentFee.toFixed(2) || "N/A"}
      </span>
    ),
  },
  {
    id: "averageRating",
    accessorKey: "averageRating",
    header: "Average Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400" />
        <span className="text-sm font-medium">
          {row.original.averageRating?.toFixed(1) || "0.0"}
        </span>
      </div>
    ),
  },
  {
    id: "gender",
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="text-sm capitalize">
        {row.original.gender.toLowerCase() || "N/A"}
      </span>
    ),
  },
  {
    id: "createAt",
    accessorKey: "createdAt",
    header: "Joined At",
    cell: ({ row }) => {
      <DateCell date={row.original.createdAt} formatString="MM dd, yyyy" />;
    },
  },
];
