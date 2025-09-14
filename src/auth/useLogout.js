import { useMutation } from "@tanstack/react-query";
import { apiEndPoints } from "../api/api";

const logoutUser = async () => {
  const { data } = axios.post(apiEndPoints.sign, {
    withCredentials: true,
  });
  return data;
};

export function useLogout() {
  return useMutation({
    mutationFn: logoutUser,

    onError: (error) => console.log(" Logout error:", error),
  });
}
