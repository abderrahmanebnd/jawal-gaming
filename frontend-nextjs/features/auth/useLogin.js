"use client";

import { apiEndPoints } from "@/routes";
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

      // Save email in sessionStorage
      sessionStorage.setItem("email", data.data.email);

      // ✅ redirect to verifyOtp page
      router.push(apiEndPoints.verifyOtp);
    },
    onError: (error) => console.error("Login error:", error),
  });
};
