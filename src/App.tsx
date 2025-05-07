
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet
} from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import { AuthProvider } from "./context/AuthContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import InvestmentsPage from "./pages/InvestmentsPage";
import TransactionsPage from "./pages/TransactionsPage";
import DepositPage from "./pages/DepositPage";
import WithdrawalPage from "./pages/WithdrawalPage";
import ProfilePage from "./pages/ProfilePage";
import ReferralsPage from "./pages/ReferralsPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useAuth } from "./context/AuthContext";
import { initializeRealtimeSubscriptions } from "./integrations/supabase/realtime";

// Create separate components for protected routes to avoid hook issues
const ProtectedRoute = () => {
  const { session } = useAuth();
  
  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const AdminRoute = () => {
  const { session, isAdmin } = useAuth();
  
  if (!session) {
    console.log("AdminRoute: No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    console.log("AdminRoute: Not admin, redirecting to dashboard");
    toast.error("Access denied: Admin privileges required");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("AdminRoute: User is admin, allowing access");
  return <Outlet />;
};

// Add component for admin redirection
const AdminRedirect = () => {
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    console.log("AdminRedirect: Admin status =", isAdmin);
  }, [isAdmin]);
  
  if (isAdmin) {
    console.log("AdminRedirect: Is admin, redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }
  
  return null;
};

function App() {
  const [initializing, setInitializing] = useState(true);
  const [realtimeSub, setRealtimeSub] = useState<{cleanup: () => void} | null>(null);

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(() => {
      setInitializing(false);
    }).catch(() => {
      setInitializing(false);
    });

    // Initialize realtime subscriptions
    const subscription = initializeRealtimeSubscriptions();
    setRealtimeSub(subscription);

    return () => {
      // Clean up subscriptions when the app unmounts
      if (realtimeSub) {
        realtimeSub.cleanup();
      }
    };
  }, []);

  if (initializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
    </div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes - wrapped with InvestmentProvider */}
          <Route element={<ProtectedRoute />}>
            <Route element={
              <InvestmentProvider>
                <Outlet />
                <AdminRedirect />
              </InvestmentProvider>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/withdraw" element={<WithdrawalPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              
              {/* Redirect old withdrawal route to the withdrawal page */}
              <Route path="/withdrawal" element={<Navigate to="/withdraw" replace />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={
                <InvestmentProvider>
                  <AdminDashboard />
                </InvestmentProvider>
              } />
              <Route path="/admin/dashboard" element={
                <InvestmentProvider>
                  <AdminDashboard />
                </InvestmentProvider>
              } />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
