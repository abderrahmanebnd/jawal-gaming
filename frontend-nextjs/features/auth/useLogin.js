"use client";

import { apiEndPoints, RoutePaths } from "@/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const loginUser = async (credentials) => {
  const { data } = await axios.post(apiEndPoints.signIn, credentials, {
    withCredentials: true,
  });
  return data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter(); // ✅ replaces useNavigate

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authCheck"] });

      sessionStorage.setItem("email", data.data.email);

      console.log('otp sent, redirecting to :...',apiEndPoints)
      router.push(RoutePaths.verifyOtp);
    },
    onError: (error) => console.error("Login error:", error),
  });
};
