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
import { InvestmentPlanManagement } from "@/components/admin/InvestmentPlanManagement";
import { DollarSign, LogOut, Users, Download, Upload, Gift, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  
  const updateStats = async () => {
    try {
      if (!user) return;

      // Fetch statistics from Supabase
      // Get total deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');

      if (depositsError) {
        console.error("Error fetching deposits:", depositsError);
      } else {
        const totalDeposits = depositsData.reduce((sum, tx) => sum + tx.amount, 0);
        stats.totalDeposits = totalDeposits;
      }

      // Get total withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');

      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
      } else {
        const totalWithdrawals = withdrawalsData.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        stats.totalWithdrawals = totalWithdrawals;
      }

      // Get pending deposits
      const { data: pendingDepositsData, error: pendingDepositsError } = await supabase
        .from('transactions')
        .select('count')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .single();

      if (!pendingDepositsError && pendingDepositsData) {
        stats.pendingDeposits = pendingDepositsData.count;
      }

      // Get pending withdrawals
      const { data: pendingWithdrawalsData, error: pendingWithdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('count')
        .eq('status', 'pending')
        .single();

      if (!pendingWithdrawalsError && pendingWithdrawalsData) {
        stats.pendingWithdrawals = pendingWithdrawalsData.count;
      }

      // Get total referral bonuses
      const { data: referralData, error: referralError } = await supabase
        .from('profiles')
        .select('referral_bonus');

      if (!referralError && referralData) {
        const totalReferralBonus = referralData.reduce((sum, profile) => 
          sum + (profile.referral_bonus || 0), 0);
        stats.totalReferralBonus = totalReferralBonus;
      }

      // Get total users count
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('count');

      if (!usersError && usersData && usersData[0]?.count) {
        stats.totalUsers = usersData[0].count;
      }

      // Update the state with new stats
      setStats({...stats});
    } catch (error) {
      console.error("Error updating admin stats:", error);
    }
  };
  
  useEffect(() => {
    // Only run this for admin users
    if (user && isAdmin) {
      updateStats();
      
      // Set up real-time subscriptions for relevant tables
      const transactionsChannel = supabase
        .channel('admin-transactions-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions' },
          () => updateStats()
        )
        .subscribe();
        
      const withdrawalsChannel = supabase
        .channel('admin-withdrawals-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'withdrawal_requests' },
          () => updateStats()
        )
        .subscribe();
        
      const profilesChannel = supabase
        .channel('admin-profiles-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          () => updateStats()
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(transactionsChannel);
        supabase.removeChannel(withdrawalsChannel);
        supabase.removeChannel(profilesChannel);
      };
    }
  }, [user, isAdmin]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user is admin
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
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
            <TabsTrigger value="plans">Investment Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {withAdminProps(UserManagement, { onUserDeleted: () => updateStats() })}
          </TabsContent>
          
          <TabsContent value="deposits">
            {withAdminProps(DepositApprovals, { onStatusChange: () => updateStats() })}
          </TabsContent>
          
          <TabsContent value="withdrawals">
            {withAdminProps(WithdrawalApprovals, { onStatusChange: () => updateStats() })}
          </TabsContent>
          
          <TabsContent value="plans">
            {withAdminProps(InvestmentPlanManagement, { onStatusChange: () => updateStats() })}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
