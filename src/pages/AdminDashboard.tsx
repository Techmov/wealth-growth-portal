
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
import { DollarSign, LogOut, Users, Download, Upload, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  useEffect(() => {
    // In a real app, fetch stats from backend
    // For now, we'll use mock data
    setStats({
      totalDeposits: 45000,
      totalWithdrawals: 28000,
      totalReferralBonus: 3200,
      pendingDeposits: 5,
      pendingWithdrawals: 12,
      totalUsers: 87,
    });
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
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="deposits">
            <DepositApprovals />
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <WithdrawalApprovals />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
