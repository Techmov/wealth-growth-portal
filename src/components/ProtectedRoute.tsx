
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - Current path:", location.pathname);
  console.log("ProtectedRoute - User state:", user ? "Authenticated" : "Not authenticated");
  console.log("ProtectedRoute - Loading state:", isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // If authentication is required and user is not logged in
  if (requireAuth && !user) {
    console.log("Authentication required but user not logged in - redirecting to login");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If admin privileges are required and user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log("Admin privileges required but user is not admin - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but this is a login/signup page, redirect to dashboard
  if (user && (location.pathname === "/login" || location.pathname === "/signup")) {
    console.log("User is authenticated and on auth page - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Route access granted");
  return <Outlet />;
};
