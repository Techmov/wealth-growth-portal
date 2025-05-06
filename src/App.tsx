
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InvestmentsPage from "./pages/InvestmentsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReferralsPage from "./pages/ReferralsPage";
import ProfilePage from "./pages/ProfilePage";
import DepositPage from "./pages/DepositPage";
import WithdrawalPage from "./pages/WithdrawalPage";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* Move InvestmentProvider inside AuthProvider */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes - Redirect to dashboard if already logged in */}
              <Route element={<ProtectedRoute requireAuth={false} />}>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>
              
              {/* Protected User Routes - Wrap these in InvestmentProvider */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/dashboard" element={
                  <InvestmentProvider>
                    <Dashboard />
                  </InvestmentProvider>
                } />
                <Route path="/investments" element={
                  <InvestmentProvider>
                    <InvestmentsPage />
                  </InvestmentProvider>
                } />
                <Route path="/transactions" element={
                  <InvestmentProvider>
                    <TransactionsPage />
                  </InvestmentProvider>
                } />
                <Route path="/deposit" element={
                  <InvestmentProvider>
                    <DepositPage />
                  </InvestmentProvider>
                } />
                <Route path="/withdraw" element={
                  <InvestmentProvider>
                    <WithdrawalPage />
                  </InvestmentProvider>
                } />
                <Route path="/referrals" element={
                  <InvestmentProvider>
                    <ReferralsPage />
                  </InvestmentProvider>
                } />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute requireAuth={true} requireAdmin={true} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
