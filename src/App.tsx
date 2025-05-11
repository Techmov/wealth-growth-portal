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
import { ThemeProvider } from "./components/ThemeProvider";
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
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useAuth } from "./context/AuthContext";
import { initializeRealtimeSubscriptions } from "./integrations/supabase/realtime";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ReferralsPage from "./pages/ReferralsPage";

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Public routes - redirect to dashboard if authenticated */}
            <Route element={<ProtectedRoute requireAuth={false} redirectTo="/dashboard" />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute requireAuth={true} redirectTo="/login" />}>
              {/* User routes - wrapped with InvestmentProvider */}
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
                <Route path="/change-password" element={<ChangePasswordPage />} />
                
                {/* Redirect old withdrawal route to the withdrawal page */}
                <Route path="/withdrawal" element={<Navigate to="/withdraw" replace />} />
              </Route>
              
              {/* Admin routes - require admin role */}
              <Route element={<ProtectedRoute requireAuth={true} requireAdmin={true} redirectTo="/dashboard" />}>
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
            
            {/* Add the ReferralsPage route */}
            <Route 
              path="/referrals" 
              element={
                <ProtectedRoute>
                  <ReferralsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
