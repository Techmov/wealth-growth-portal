
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { Chart } from "@/components/admin/dashboard/Chart";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { AdminMetricsSummary } from "@/components/admin/dashboard/AdminMetricsSummary";
import { Users, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { Loader2 } from "lucide-react";

export function AdminDashboardOverview() {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  
  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      console.log("Fetching admin metrics");
      
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });
      
      if (usersError) {
        console.error("Error fetching users count:", usersError);
        throw usersError;
      }
      
      // Get total deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "deposit")
        .eq("status", "completed");
        
      if (depositsError) {
        console.error("Error fetching deposits:", depositsError);
        throw depositsError;
      }
      
      const totalDeposits = deposits.reduce((sum, item) => sum + Number(item.amount), 0);
      
      // Get total withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "withdrawal")
        .eq("status", "completed");
        
      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
        throw withdrawalsError;
      }
      
      const totalWithdrawals = withdrawals.reduce((sum, item) => sum + Number(item.amount), 0);
      
      // Get active investments
      const { count: activeInvestments, error: investmentsError } = await supabase
        .from("investments")
        .select("*", { count: 'exact', head: true })
        .eq("status", "active");
        
      if (investmentsError) {
        console.error("Error fetching active investments:", investmentsError);
        throw investmentsError;
      }
      
      return {
        usersCount: usersCount || 0,
        totalDeposits,
        totalWithdrawals,
        activeInvestments: activeInvestments || 0,
        netFlow: totalDeposits - totalWithdrawals
      };
    },
    refetchInterval: 60000 // Refresh every 60 seconds
  });
  
  // Get recent activities
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      // Get recent transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(10);
      
      if (txError) {
        console.error("Error fetching recent transactions:", txError);
        throw txError;
      }
      
      // Get recent registrations
      const { data: registrations, error: regError } = await supabase
        .from("profiles")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (regError) {
        console.error("Error fetching recent registrations:", regError);
        throw regError;
      }
      
      return {
        transactions,
        registrations
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  if (metricsLoading || activitiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      
      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={metrics?.usersCount.toLocaleString() || "0"}
          description="Total registered users"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Deposits"
          value={`$${metrics?.totalDeposits.toLocaleString() || "0"}`}
          description="Total amount deposited"
          icon={<Wallet className="h-4 w-4" />}
          trend="up"
          trendValue="+2.5% from last week"
        />
        <StatCard
          title="Active Investments"
          value={metrics?.activeInvestments.toLocaleString() || "0"}
          description="Currently active investments"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Net Cash Flow"
          value={`$${metrics?.netFlow.toLocaleString() || "0"}`}
          description="Deposits minus withdrawals"
          icon={<DollarSign className="h-4 w-4" />}
          trend={metrics?.netFlow >= 0 ? "up" : "down"}
          trendValue={metrics?.netFlow >= 0 ? "Positive flow" : "Negative flow"}
          valueClassName={metrics?.netFlow >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>
      
      {/* Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Chart 
          title="Investment Growth" 
          type="line" 
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <Chart 
          title="Deposit vs Withdrawal" 
          type="bar" 
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>
      
      {/* Additional metrics and activity feed */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="md:col-span-3">
          <AdminMetricsSummary />
        </div>
        <div className="md:col-span-2">
          <ActivityFeed 
            transactions={recentActivities?.transactions} 
            registrations={recentActivities?.registrations}
          />
        </div>
      </div>
    </div>
  );
}
