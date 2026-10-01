"use client";
import { logoutAction } from "@/app/_actions/auth.actions";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

// shared by the user menu and the sidebar "Logout" box
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, startLogout] = useTransition();

  const logout = () =>
    startLogout(async () => {
      await logoutAction();
      // drop every cached API response so the next user can't see this user's data
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    });

  return { logout, isLoggingOut };
};
