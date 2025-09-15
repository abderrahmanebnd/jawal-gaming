"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiEndPoints, RoutePaths } from "@/routes";

const verifyOtp = async (credentials) => {
  const { data } = await axios.post(apiEndPoints.verifyOtp, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authCheck"] });

      const role = data?.data?.user?.role?.toLowerCase();

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("email");
      }

      if (role === "admin") {
        router.push(RoutePaths.adminDashboard);
      } else if (role === "user") {
        router.push(RoutePaths.userDashboard);
      } else {
        console.warn("Unknown role, staying on page.");
      }
    },
    onError: (error) => {
      console.error("Verify otp error:", error);
      alert(error.response?.data?.message || "Failed to verify OTP");
    },
  });
};
