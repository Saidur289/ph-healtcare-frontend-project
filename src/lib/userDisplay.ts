import { UserInfo } from "@/types/user.types";

export const roleLabel = (role: string) =>
  role
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const userPhoto = (userInfo: UserInfo) =>
  userInfo.Doctor?.profilePhoto ??
  userInfo.Patient?.profilePhoto ??
  userInfo.Admin?.profilePhoto ??
  userInfo.image ??
  undefined;

export const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
