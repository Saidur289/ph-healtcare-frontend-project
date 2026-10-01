import StatusPill from "@/components/shared/StatusPill";
import { UserStatus } from "@/types/doctor.types";

const StatusBadgeCell = ({ status }: { status: UserStatus | string }) => <StatusPill status={status} />;

export default StatusBadgeCell;
