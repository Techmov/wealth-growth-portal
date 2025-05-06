
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { UserLayout } from "@/components/UserLayout";
import { StatCard } from "@/components/StatCard";
import { TransactionsList } from "@/components/TransactionsList";
import { InvestmentCard } from "@/components/InvestmentCard";
import { Loader2, TrendingUp, Wallet, ArrowUpDown, Users } from "lucide-react";

// Export the Dashboard component as default
export default function Dashboard() {
  const { user } = useAuth();
  const { products, userInvestments, transactions, isLoading } = useInvestment();

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  // Calculate statistics for the dashboard
  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
  const totalActiveInvestments = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = activeInvestments.reduce((sum, inv) => sum + (inv.currentValue - inv.startingValue), 0);
  const returnRate = totalActiveInvestments > 0 
    ? (totalReturns / totalActiveInvestments) * 100 
    : 0;
  
  return (
    <UserLayout>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Available Balance" 
          value={user ? `$${user.balance.toFixed(2)}` : "$0.00"} 
          icon={<Wallet className="h-5 w-5" />}
          description="Current balance" 
        />
        <StatCard 
          title="Active Investments" 
          value={user ? `$${totalActiveInvestments.toFixed(2)}` : "$0.00"} 
          icon={<TrendingUp className="h-5 w-5" />}
          description="Across all plans" 
        />
        <StatCard 
          title="Total Returns" 
          value={user ? `$${totalReturns.toFixed(2)}` : "$0.00"} 
          icon={<ArrowUpDown className="h-5 w-5" />}
          description={`${returnRate.toFixed(2)}% ROI`} 
        />
        <StatCard 
          title="Referral Bonus" 
          value={user ? `$${user.referralBonus.toFixed(2)}` : "$0.00"} 
          icon={<Users className="h-5 w-5" />}
          description="From referrals" 
        />
      </div>

      {/* Investments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Investments</h2>
        {activeInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeInvestments.map(investment => {
              const product = products.find(p => p.id === investment.productId);
              return product ? (
                <InvestmentCard 
                  key={investment.id}
                  product={product}
                />
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No active investments. Visit the Investments page to get started.</p>
        )}
      </div>

      {/* Transactions */}
      <TransactionsList transactions={transactions} />
    </UserLayout>
  );
}
