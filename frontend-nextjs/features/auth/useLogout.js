"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiEndPoints } from "@/routes";

const logoutUser = async () => {
  const { data } = await axios.get(apiEndPoints.signOut, {
    withCredentials: true,
  });
  return data;
};

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      console.log("Logout successful:", data);
      sessionStorage.removeItem("email");
      router.push("/");
    },
    onError: (error) => console.log("Logout error:", error),
  });
}
