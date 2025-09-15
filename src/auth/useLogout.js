import { useMutation } from "@tanstack/react-query";
import { apiEndPoints } from "../api/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RoutePaths } from "../routes";

const logoutUser = async () => {
  const { data } = await axios.get(apiEndPoints.signOut, {
    withCredentials: true,
  });
  return data;
};

export function useLogout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      console.log("Logout successful:", data);
      sessionStorage.removeItem("email");
      navigate(RoutePaths.home); // Redirect to home page after logout
    },
    onError: (error) => console.log(" Logout error:", error),
  });
}
