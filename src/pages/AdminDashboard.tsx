
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStats } from "@/types";
import { UserManagement } from "@/components/admin/UserManagement";
import { DepositApprovals } from "@/components/admin/DepositApprovals";
import { WithdrawalApprovals } from "@/components/admin/WithdrawalApprovals";
import { AddUser } from "@/components/admin/AddUser";
import { PaymentSettings } from "@/components/admin/PaymentSettings";
import { DollarSign, LogOut, Users, Download, Upload, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminComponentProps {
  onUserDeleted?: () => void;
  onStatusChange?: () => void;
}

// Create a HOC to pass the props correctly
const withAdminProps = (Component: React.ComponentType<AdminComponentProps>, props: AdminComponentProps) => {
  return <Component {...props} />;
};

const AdminDashboard = () => {
  const { user, isLoading, isAdmin, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalReferralBonus: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalUsers: 0,
  });
  
  const updateStats = () => {
    try {
      // Get all registered users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Get pending deposits
      const deposits = JSON.parse(localStorage.getItem("pendingDeposits") || "[]");
      const pendingDeposits = deposits.filter(d => d.status === "pending").length;
      
      // Get pending withdrawals
      const withdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals") || "[]");
      const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;
      
      // Calculate totals from users and transactions
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalReferralBonus = 0;
      
      users.forEach(user => {
        totalDeposits += user.totalInvested || 0;
        totalWithdrawals += user.totalWithdrawn || 0;
        totalReferralBonus += user.referralBonus || 0;
      });
      
      const newStats = {
        totalDeposits,
        totalWithdrawals,
        totalReferralBonus,
        pendingDeposits,
        pendingWithdrawals,
        totalUsers: users.length,
      };
      
      setStats(newStats);
      console.log("Updated admin stats:", newStats);
    } catch (error) {
      console.error("Error updating admin stats:", error);
    }
  };
  
  useEffect(() => {
    // Initial stats update
    updateStats();
    
    // Listen for events that should trigger stats update
    const handleUserDeleted = () => {
      console.log("User deleted event received");
      updateStats();
    };
    
    const handleDepositStatusChange = () => {
      console.log("Deposit status change event received");
      updateStats();
    };
    
    const handleWithdrawalStatusChange = () => {
      console.log("Withdrawal status change event received");
      updateStats();
    };
    
    const handleUserSignup = () => {
      console.log("User signup event received");
      updateStats();
    };
    
    const handleReferralBonusAdded = () => {
      console.log("Referral bonus added event received");
      updateStats();
    };
    
    // Add event listeners
    window.addEventListener("userDeleted", handleUserDeleted);
    window.addEventListener("depositStatusChange", handleDepositStatusChange);
    window.addEventListener("withdrawalStatusChange", handleWithdrawalStatusChange);
    window.addEventListener("userSignup", handleUserSignup);
    window.addEventListener("referralBonusAdded", handleReferralBonusAdded);
    
    // Set interval to periodically refresh stats (every 30 seconds)
    const statsInterval = setInterval(updateStats, 30000);
    
    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener("userDeleted", handleUserDeleted);
      window.removeEventListener("depositStatusChange", handleDepositStatusChange);
      window.removeEventListener("withdrawalStatusChange", handleWithdrawalStatusChange);
      window.removeEventListener("userSignup", handleUserSignup);
      window.removeEventListener("referralBonusAdded", handleReferralBonusAdded);
      clearInterval(statsInterval);
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Deposits"
            value={`$${stats.totalDeposits.toLocaleString()}`}
            description="All time"
            icon={<DollarSign />}
            trend="up"
            trendValue="+12% from last month"
          />
          <StatCard
            title="Total Withdrawals"
            value={`$${stats.totalWithdrawals.toLocaleString()}`}
            description="All time"
            icon={<Download />}
          />
          <StatCard
            title="Total Referral Bonus"
            value={`$${stats.totalReferralBonus.toLocaleString()}`}
            description="All time"
            icon={<Gift />}
          />
          <StatCard
            title="Pending Deposits"
            value={stats.pendingDeposits}
            description="Awaiting approval"
            icon={<Upload />}
            valueClassName="text-yellow-500"
          />
          <StatCard
            title="Pending Withdrawals"
            value={stats.pendingWithdrawals}
            description="Awaiting approval"
            icon={<Download />}
            valueClassName="text-yellow-500"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered users"
            icon={<Users />}
          />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="deposits">Deposit Approvals</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Approvals</TabsTrigger>
            <TabsTrigger value="add-user">Add User</TabsTrigger>
            <TabsTrigger value="payment-settings">Payment Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {withAdminProps(UserManagement, { onUserDeleted: updateStats })}
          </TabsContent>
          
          <TabsContent value="deposits">
            {withAdminProps(DepositApprovals, { onStatusChange: updateStats })}
          </TabsContent>
          
          <TabsContent value="withdrawals">
            {withAdminProps(WithdrawalApprovals, { onStatusChange: updateStats })}
          </TabsContent>
          
          <TabsContent value="add-user">
            <AddUser onUserAdded={updateStats} />
          </TabsContent>
          
          <TabsContent value="payment-settings">
            <PaymentSettings />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
