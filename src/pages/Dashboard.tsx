
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { TransactionsList } from "@/components/TransactionsList";
import { Transaction, Investment } from "@/types";
import {
  Wallet,
  ArrowDown,
  ArrowUp,
  BarChart2,
  TrendingUp,
  Gift,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";

// New component for investment item to reduce complexity
const InvestmentItem = ({ investment, product }: { investment: Investment, product: any }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium">{product?.name || "Investment"}</h3>
        <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          Active
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invested Amount:</span>
          <span>${investment.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Value:</span>
          <span>${investment.currentValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">End Date:</span>
          <span>{new Date(investment.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { products, userInvestments, transactions, isLoading: investmentLoading } = useInvestment();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Get 5 most recent transactions
    if (transactions && transactions.length > 0) {
      const sorted = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentTransactions(sorted);
    }
  }, [transactions]);

  if (authLoading || investmentLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
    </div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Guard against undefined investments array
  const activeInvestments = userInvestments?.filter(inv => inv.status === 'active') || [];
  
  // Calculate total invested amount
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Calculate current investment value
  const currentInvestmentValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Calculate profit/loss
  const profitLoss = currentInvestmentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 
    ? ((profitLoss / totalInvested) * 100).toFixed(2) 
    : '0.00';

  return (
    <UserLayout>
      <div className="container py-6">
        {/* Welcome and Stats Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your investment portfolio and account activity.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Available Balance"
            value={`$${user.balance.toFixed(2)}`}
            description="Ready to invest"
            icon={<Wallet className="h-5 w-5 text-primary" />}
            onAction={() => navigate("/transactions")}
          />
          <StatCard
            title="Total Invested"
            value={`$${user.totalInvested.toFixed(2)}`}
            description={`${activeInvestments.length} active investments`}
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            onAction={() => navigate("/investments")}
          />
          <StatCard
            title="Total Withdrawn"
            value={`$${user.totalWithdrawn.toFixed(2)}`}
            description="All time"
            icon={<ArrowDown className="h-5 w-5 text-red-600" />}
          />
          <StatCard
            title="Referral Bonus"
            value={`$${user.referralBonus.toFixed(2)}`}
            description="From referrals"
            icon={<Gift className="h-5 w-5 text-purple-600" />}
            onAction={() => navigate("/referrals")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                Investment Portfolio
              </CardTitle>
              <CardDescription>
                Your current investment performance and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-muted px-4 py-3 rounded-lg flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                  <div className="text-2xl font-bold">${currentInvestmentValue.toFixed(2)}</div>
                </div>
                <div className="bg-muted px-4 py-3 rounded-lg flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Profit/Loss</div>
                  <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage}%)
                  </div>
                </div>
              </div>

              {activeInvestments.length > 0 ? (
                <div className="space-y-4">
                  {activeInvestments.slice(0, 2).map(investment => {
                    // Find matching product for this investment
                    const investmentProduct = products?.find(p => p.id === investment.productId);
                    
                    return (
                      <InvestmentItem 
                        key={investment.id}
                        investment={investment}
                        product={investmentProduct}
                      />
                    );
                  })}
                  
                  {activeInvestments.length > 2 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2" 
                      onClick={() => navigate("/investments")}
                    >
                      View All Investments ({activeInvestments.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <div className="mb-3 inline-flex p-3 bg-muted rounded-full">
                    <CircleDollarSign className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No Active Investments</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start growing your wealth today</p>
                  <Button onClick={() => navigate("/investments")}>Explore Investment Plans</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" /> 
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest transactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <TransactionsList transactions={recentTransactions} />
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No recent transactions</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/transactions")}
              >
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <ArrowUp className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Deposit Funds</h3>
              <p className="text-sm text-muted-foreground mb-4">Add money to invest in our plans</p>
              <Button onClick={() => navigate("/transactions")} variant="default" className="w-full">
                Make a Deposit
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Start Investing</h3>
              <p className="text-sm text-muted-foreground mb-4">Explore our investment plans</p>
              <Button onClick={() => navigate("/investments")} variant="default" className="w-full">
                View Plans
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Earn More</h3>
              <p className="text-sm text-muted-foreground mb-4">Refer friends and earn bonuses</p>
              <Button onClick={() => navigate("/referrals")} variant="default" className="w-full">
                Referral Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
