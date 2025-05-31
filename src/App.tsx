
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
import { ProtectedRoute } from "./components/ProtectedRoute";
import ReferralsPage from "./pages/ReferralsPage";
import { memo } from "react";

// Optimized admin redirect component
const AdminRedirect = memo(() => {
  const { isAdmin } = useAuth();
  
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return null;
});

AdminRedirect.displayName = "AdminRedirect";

function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Quick session check without heavy operations
    supabase.auth.getSession().then(() => {
      setInitializing(false);
    }).catch(() => {
      setInitializing(false);
    });
  }, []);

  if (initializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
    </div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Public routes */}
            <Route element={<ProtectedRoute requireAuth={false} redirectTo="/dashboard" />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute requireAuth={true} redirectTo="/login" />}>
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
                <Route path="/referrals" element={<ReferralsPage />} />
                <Route path="/withdrawal" element={<Navigate to="/withdraw" replace />} />
              </Route>
              
              {/* Admin routes */}
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
