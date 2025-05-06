
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { TransactionsList } from "@/components/TransactionsList";
import { ArrowUp, DollarSign, WalletIcon, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Investment } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions: contextTransactions } = useInvestment();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (transactionError) {
          console.error("Error fetching transactions:", transactionError);
        } else {
          // Format transactions
          const formattedTransactions: Transaction[] = transactionData.map(tx => ({
            id: tx.id,
            userId: tx.user_id,
            type: tx.type as 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral',
            amount: tx.amount,
            status: tx.status as 'pending' | 'completed' | 'failed' | 'rejected',
            date: new Date(tx.date || Date.now()),
            description: tx.description,
            trc20Address: tx.trc20_address,
            txHash: tx.tx_hash,
            depositScreenshot: tx.deposit_screenshot,
            rejectionReason: tx.rejection_reason
          }));
          setTransactions(formattedTransactions);
        }

        // Fetch user's active investments
        const { data: investmentData, error: investmentError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (investmentError) {
          console.error("Error fetching investments:", investmentError);
        } else {
          // Format investments
          const formattedInvestments: Investment[] = investmentData.map(inv => ({
            id: inv.id,
            userId: inv.user_id,
            productId: inv.product_id,
            amount: inv.amount,
            startDate: new Date(inv.start_date || Date.now()),
            endDate: new Date(inv.end_date),
            startingValue: inv.starting_value,
            currentValue: inv.current_value,
            finalValue: inv.final_value,
            status: inv.status as 'active' | 'completed' | 'cancelled'
          }));
          setInvestments(formattedInvestments);
        }
      } catch (error) {
        console.error("Unexpected error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscription for updates
    const transactionChannel = supabase
      .channel('dashboard-transactions')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();
      
    const investmentChannel = supabase
      .channel('dashboard-investments')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(investmentChannel);
    };
  }, [user, navigate]);

  if (!user) return null;

  // Calculate total active investment value
  const totalActiveInvestment = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Calculate total projected final value
  const totalProjectedValue = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.finalValue, 0);

  return (
    <UserLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your wealth growth journey
          </p>
        </div>

        {/* Quick Access Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/investments" className="block">
            <Card className="hover:bg-accent/10 transition-colors h-full">
              <CardContent className="p-4 text-center">
                <TrendingUp className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">Investments</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/deposit" className="block">
            <Card className="hover:bg-accent/10 transition-colors h-full">
              <CardContent className="p-4 text-center">
                <ArrowUp className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">Deposit</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/withdraw" className="block">
            <Card className="hover:bg-accent/10 transition-colors h-full">
              <CardContent className="p-4 text-center">
                <ArrowUp className="mx-auto h-8 w-8 mb-2 rotate-180" />
                <p className="font-medium">Withdraw</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/referrals" className="block">
            <Card className="hover:bg-accent/10 transition-colors h-full">
              <CardContent className="p-4 text-center">
                <Users className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">Referrals</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Available Balance"
            value={`$${user.balance.toFixed(2)}`}
            description="Available to invest or withdraw"
            icon={<WalletIcon className="h-4 w-4" />}
          />
          
          <StatCard
            title="Active Investments"
            value={`$${totalActiveInvestment.toFixed(2)}`}
            description="Currently growing investments"
            icon={<DollarSign className="h-4 w-4" />}
            trend="up"
            trendValue={`+$${(totalProjectedValue - totalActiveInvestment).toFixed(2)} Projected`}
            isGrowing={true}
          />
          
          <StatCard
            title="Referral Earnings"
            value={`$${user.referralBonus.toFixed(2)}`}
            description="From successful referrals"
            icon={<ArrowUp className="h-4 w-4" />}
          />
          
          <StatCard
            title="Total Withdrawn"
            value={`$${user.totalWithdrawn.toFixed(2)}`}
            description="Successfully withdrawn funds"
            icon={<ArrowUp className="h-4 w-4 rotate-180" />}
          />
        </div>

        {/* Investment Summary and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Investments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>
                  Your current investment portfolio
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/investments")} variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : investments.length > 0 ? (
                <div className="space-y-4">
                  {investments
                    .filter(inv => inv.status === 'active')
                    .map((investment) => (
                      <div key={investment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Investment #{investment.id.slice(-4)}</p>
                            <p className="text-sm text-muted-foreground">
                              Ends on {investment.endDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Active
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Initial</p>
                            <p className="font-medium">${investment.startingValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current</p>
                            <p className="font-medium animate-pulse-gentle text-wealth-accent">
                              ${investment.currentValue.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Projected</p>
                            <p className="font-medium">${investment.finalValue.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-wealth-accent"
                            style={{ 
                              width: `${((investment.currentValue - investment.startingValue) / 
                                (investment.finalValue - investment.startingValue)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any active investments yet.</p>
                  <Button onClick={() => navigate("/investments")}>Start Investing</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <TransactionsList transactions={transactions} />
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
                      View All Transactions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions yet</p>
                  <Button onClick={() => navigate("/transactions")}>Make a Deposit</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
