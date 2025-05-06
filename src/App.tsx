
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
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
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

// Separate ProtectedRoute component to use the useAuth hook
function ProtectedRouteContent() {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

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
          
          {/* Protected routes */}
          <Route element={<ProtectedRouteContent />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/withdrawal" element={<WithdrawalPage />} />
            <Route path="/deposit" element={<DepositPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
