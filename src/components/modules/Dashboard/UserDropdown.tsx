"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { initials, roleLabel, userPhoto } from "@/lib/userDisplay";
import { UserInfo } from "@/types/user.types";
import { ChevronDown, Key, Loader2, LogOut, User } from "lucide-react";
import Link from "next/link";

// user chip from the design: avatar, name and role; opens the account menu
const UserDropdown = ({ userInfo }: { userInfo: UserInfo }) => {
  const { logout, isLoggingOut } = useLogout();
  const displayName = userInfo.role === "DOCTOR" ? `Dr. ${userInfo.name}` : userInfo.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userPhoto(userInfo)} alt="" />
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {initials(userInfo.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block max-w-36 truncate text-[13px] font-semibold">{displayName}</span>
            <span className="block text-xs text-muted-foreground">{roleLabel(userInfo.role)}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{userInfo.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/my-profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="cursor-pointer">
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logout();
          }}
          disabled={isLoggingOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
