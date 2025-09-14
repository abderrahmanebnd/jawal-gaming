import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiEndPoints } from "../api/api";

const loginUser = async (credentials) => {
  const { data } = axios.post(apiEndPoints.signIn, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["authCheck"]);
      navigate(
         "/verify-otp"
         //TODO:create verify otp page and route
      //   data
      //     ? data.role === "ADMIN"
      //       ? RoutePaths.adminDashboard
      //       : RoutePaths.userDashboard
      //     : null
      );
    },
    onError: (error) => console.error("Login error:", error)
  });
};
