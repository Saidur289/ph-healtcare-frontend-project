import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfoCellProps {
  name: string;
  email: string;
  profilePhoto?: string;
}
const UserInfoCell = ({ name, email, profilePhoto }: UserInfoCellProps) => {
  const initials = name
    .split("")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2); // limit to 2 characters
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={profilePhoto || undefined} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
};
export default UserInfoCell;
