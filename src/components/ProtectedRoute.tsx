
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

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

  // Log state only once per render to reduce noise
  useEffect(() => {
    console.log("ProtectedRoute - Current path:", location.pathname);
    console.log("ProtectedRoute - User state:", user ? "Authenticated" : "Not authenticated");
    console.log("ProtectedRoute - Loading state:", isLoading);
  }, [location.pathname, user, isLoading]);

  // Handle loading state
  if (isLoading && requireAuth && !location.pathname.includes("login") && !location.pathname.includes("signup")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Don't make any redirect decisions while loading
  if (isLoading) {
    console.log("ProtectedRoute: Still loading, deferring redirection decision");
    return <Outlet />;
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
