import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { RoutePaths } from "../routes";



export default function ProtectedRoute({ children,allowedRoles }) {
  const { user, loading } = useAuth();

 if (loading)
   return (
     <div
       style={{
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         height: "100vh",
       }}
     >
       <p
         className="animate-spin  w-48"
         style={{
           fontSize: "32px",
         }}
       >
         Loading...
       </p>
     </div>
   );
  if (!user) {
    return <Navigate to={RoutePaths.login} replace />;
  }
  if(allowedRoles && !allowedRoles.includes(user.role)){
    return <Navigate to="/unauthorized" replace />;
    //TODO: create unauthorized page
  }

  return children;
}
