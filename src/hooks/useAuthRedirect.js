import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RoutePaths } from "../routes";


const useAuthRedirect = () => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in and user status is 150, and if so, navigate to home otherwise navigate to support center
    if (isLoggedIn) {
      navigate(RoutePaths.adminDashboard);
    }
  }, [isLoggedIn, navigate]);
};

export default useAuthRedirect;
