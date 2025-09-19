// components/GuestRoute.js
"use client";

import { useAuth } from "@/providers/AuthProvider";
import { RoutePaths } from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const destination = user.role === "admin" ? RoutePaths.adminDashboard : "/";
      router.push(destination);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) return null;

  return children;
}
