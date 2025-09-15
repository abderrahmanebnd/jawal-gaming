// hooks/useResendOtp.js
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiEndPoints } from "../api/api";

const resendOtp = async (email) => {
  const { data } = await axios.post(apiEndPoints.resendOtp, { email },{withCredentials: true});
  return data;
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      alert("A new OTP has been sent to your email.");
    },
    onError: (error) => {
      console.error("Resend otp error:", error);
      alert(error.response?.data?.message || "Failed to resend OTP");
    },
  });
};
