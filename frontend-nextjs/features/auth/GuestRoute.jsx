import { useAuth } from "../context/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";
import { RoutePaths } from "../routes";
import Loader from "../components/Loader";
const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return !user ? (
    <Outlet />
  ) : (
    <Navigate
      to={`${
        user.role === "admin"
          ? RoutePaths.adminDashboard
          : RoutePaths.userDashboard
      }`}
      replace
    />
  );
};

export default GuestRoute;
