"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiEndPoints } from "@/routes";

const resendOtp = async (email) => {
  const { data } = await axios.post(apiEndPoints.resendOtp, email, {
    withCredentials: true,
  });
  return data;
};

export const useResendOtp = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      alert("OTP resent successfully");
    },
    onError: (error) => {
      console.error("Resend otp error:", error);
      alert(error.response?.data?.message || "Failed to resend OTP");
    },
  });
};
