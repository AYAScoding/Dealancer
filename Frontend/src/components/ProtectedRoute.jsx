import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce profile completion before interacting with jobs, bids, or dashboards
  if (!user.is_profile_complete && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace state={{ from: location, mustComplete: true }} />;
  }

  const userRole = user && user.role ? user.role.toUpperCase() : "";
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
    // If user's role isn't allowed, send them to their respective dashboard
    const redirectPath = userRole === "FREELANCER" ? "/freelancer/dashboard" : "/client/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

