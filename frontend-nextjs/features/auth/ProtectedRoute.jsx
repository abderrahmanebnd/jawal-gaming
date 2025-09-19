"use client";

import { useAuth } from "@/providers/AuthProvider";
import { RoutePaths } from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(RoutePaths.login);
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        //TODO
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}