import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { RoutePaths } from "../routes";
import Loader from "../components/Loader";
import { TRUE } from "sass";


export default function ProtectedRoute({ children,allowedRoles }) {
  const { user, loading } = useAuth();
 if (loading)
   return (
     <Loader/>
   );
  if (!user) {
    return <Navigate to={RoutePaths.login} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
    //TODO: create unauthorized page
  }

  return <Outlet />;
}
