import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/doctor.types";

interface IStatusBadgeCellProps {
  status: UserStatus;
}
const StatusBadgeCell = ({ status }: IStatusBadgeCellProps) => {
  return (
    <Badge
      variant={
        status === UserStatus.ACTIVE
          ? "default"
          : status === UserStatus.BLOCKED
            ? "destructive"
            : "secondary"
      }
    >
      <span className="capitalize text-sm">{status}</span>
    </Badge>
  );
};
export default StatusBadgeCell;
