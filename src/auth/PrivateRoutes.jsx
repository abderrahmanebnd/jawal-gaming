import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../routes";

const PrivateRoutes = () => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const navigate = useNavigate();
  if (isLoggedIn) {
    return <Outlet />;
  }
  navigate(RoutePaths.home)
  return <></>;

};

export default PrivateRoutes;
