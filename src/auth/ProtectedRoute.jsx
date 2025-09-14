import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../context/AuthProvider";



export default function ProtectedRoute({ children,allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader className="animate-spin size-48" />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if(allowedRoles && !allowedRoles.includes(user.role)){
    return <Navigate to="/unauthorized" replace />;
    //TODO: create unauthorized page
  }

  return children;
}
