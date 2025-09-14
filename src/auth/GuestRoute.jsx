import { Loader } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";
import { RoutePaths } from "../routes";

const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p className="animate-spin  w-48" style={{
         fontSize: '32px',

      }
   } >
      Loading...
   </p>
    </div>
  );

  return !user ? <Outlet /> : <Navigate to={`${user.data === 'ADMIN' ? RoutePaths.adminDashboard : RoutePaths.userDashboard}`} replace />;
};

export default GuestRoute;
