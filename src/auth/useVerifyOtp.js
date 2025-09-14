import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiEndPoints } from "../api/api";

const  verifyOtp= async (credentials) => {
  const { data } = axios.post(apiEndPoints.verifyOtp, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      queryClient.invalidateQueries(["authCheck"]);
      navigate(
          data
            ? data.role === "ADMIN"
              ? RoutePaths.adminDashboard
              : RoutePaths.userDashboard
            : null
      );
    },
    onError: (error) => console.error("Verify otp error:", error),
  });
};
