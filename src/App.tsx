
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
import Dashboard from "./pages/Dashboard"; // This should now work with the default export
import InvestmentsPage from "./pages/InvestmentsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import WithdrawalPage from "./pages/WithdrawalPage";
import DepositPage from "./pages/DepositPage";
import ReferralsPage from "./pages/ReferralsPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useAuth } from "./context/AuthContext";

// Create separate components for protected routes to avoid hook issues
// Important fix: Move the components outside of the main App component
const ProtectedRoute = () => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const AdminRoute = () => {
  const { session, isAdmin } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
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
              </InvestmentProvider>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/withdrawal" element={<WithdrawalPage />} />
              <Route path="/withdraw" element={<WithdrawalPage />} /> {/* Added this alias */}
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={
                <InvestmentProvider>
                  <AdminDashboard />
                </InvestmentProvider>
              } />
              {/* Add specific admin route for dashboard to fix 404 error */}
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
