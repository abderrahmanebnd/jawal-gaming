import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiEndPoints } from "../api/api";
import axios from "axios";

async function getMeApi() {
  const response = await axios.get(apiEndPoints.getMe, { withCredentials: true });
  return response.data.data.user;
}
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["authCheck"],
    queryFn: getMeApi,
    retry: 1,
    // ✅ stop unnecessary refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    // ✅ keep the user cached in memory
    staleTime: 1000 * 60 * 10, // 10 minutes (adjust as needed)
    cacheTime: 1000 * 60 * 30, // keep cache for 30 minutes
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        loading: isPending,
        error,
        //   setUser: ,
      }}
    >
      {children}
    </AuthContext.Provider>  
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
