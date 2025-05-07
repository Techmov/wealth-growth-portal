
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
  const { user, isAdmin, isLoading, session } = useAuth();
  const location = useLocation();

  // Log state for debugging
  useEffect(() => {
    console.log("ProtectedRoute - Path:", location.pathname);
    console.log("ProtectedRoute - Auth state:", { 
      hasSession: !!session,
      hasUser: !!user,
      isAdmin,
      isLoading
    });
  }, [location.pathname, user, session, isAdmin, isLoading]);

  // Handle loading state (but with a more graceful component)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Use session as the single source of truth for authentication
  const isAuthenticated = !!session;

  // If authentication is required and user is not logged in
  if (requireAuth && !isAuthenticated) {
    console.log("Authentication required but not logged in - redirecting to", redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If admin privileges are required and user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log("Admin privileges required but not admin - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but this is a login/signup page, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    console.log("Already authenticated on auth page - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Route access granted");
  return <Outlet />;
};
