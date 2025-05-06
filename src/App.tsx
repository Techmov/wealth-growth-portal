
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
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import InvestmentsPage from "./pages/InvestmentsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import ReferralsPage from "./pages/ReferralsPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useAuth } from "./context/AuthContext";

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

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(() => {
      setInitializing(false);
    }).catch(() => {
      setInitializing(false);
    });
  }, []);

  if (initializing) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
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
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              
              {/* Redirect old deposit/withdraw routes to the transactions page */}
              <Route path="/deposit" element={<Navigate to="/transactions" replace />} />
              <Route path="/withdraw" element={<Navigate to="/transactions" replace />} />
              <Route path="/withdrawal" element={<Navigate to="/transactions" replace />} />
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
