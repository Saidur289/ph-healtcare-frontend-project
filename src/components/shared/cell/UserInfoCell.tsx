import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/userDisplay";
import { Mars, Venus } from "lucide-react";

interface UserInfoCellProps {
  name: string;
  email?: string;
  profilePhoto?: string | null;
  gender?: "MALE" | "FEMALE" | string | null;
  age?: number | null;
}

// avatar + name, with gender icon and age (design) or the email underneath
const UserInfoCell = ({ name, email, profilePhoto, gender, age }: UserInfoCellProps) => {
  const GenderIcon = gender === "FEMALE" ? Venus : gender === "MALE" ? Mars : null;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={profilePhoto || undefined} alt="" />
        <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium">{name}</span>
        {GenderIcon || age ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {GenderIcon && <GenderIcon className="h-3 w-3" aria-label={gender === "FEMALE" ? "Female" : "Male"} />}
            {age ? `${age} yrs` : null}
          </span>
        ) : (
          email && <span className="truncate text-xs text-muted-foreground">{email}</span>
        )}
      </div>
    </div>
  );
};
export default UserInfoCell;
