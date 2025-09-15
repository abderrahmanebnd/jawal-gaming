import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiEndPoints } from "../api/api";
import { RoutePaths } from "../routes";

const loginUser = async (credentials) => {
  const { data } = await axios.post(apiEndPoints.signIn, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["authCheck"]);
       sessionStorage.setItem("email", data.data.email);
       navigate(RoutePaths.verifyOtp);
      
    },
    onError: (error) => console.error("Login error:", error)
  });
};
