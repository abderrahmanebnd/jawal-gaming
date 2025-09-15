import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiEndPoints } from "../api/api";
import { RoutePaths } from "../routes";

const  verifyOtp= async (credentials) => {
  const { data } = await axios.post(apiEndPoints.verifyOtp, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["authCheck"]);
            sessionStorage.removeItem("email");
      navigate(
          data
            ? data.data.user.role === "admin"
              ? RoutePaths.adminDashboard
              : RoutePaths.userDashboard
            : null
      );
    },
    onError: (error) =>{
      console.error("Verify otp error:", error),
      alert(error.response?.data?.message || "Failed to verify OTP")
    } 
  });
};
