
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { InvestmentCard } from "@/components/InvestmentCard";
import { ActiveInvestmentCard } from "@/components/ActiveInvestmentCard";
import { Product, Investment } from "@/types";
import { TrendingUp, CircleDollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InvestmentsPage = () => {
  const { user } = useAuth();
  const { products, userInvestments, isLoading } = useInvestment();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  // Filter investments by status
  const activeInvestments = userInvestments?.filter(inv => inv.status === 'active') || [];
  const completedInvestments = userInvestments?.filter(inv => 
    inv.status === 'completed' || 
    (inv.endDate && new Date(inv.endDate) < new Date())
  ) || [];
  
  // All investments that don't fit into the above categories
  const otherInvestments = userInvestments?.filter(inv => 
    inv.status !== 'active' && 
    inv.status !== 'completed' &&
    !(inv.endDate && new Date(inv.endDate) < new Date())
  ) || [];

  // Calculate total investment stats
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentInvestmentValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = currentInvestmentValue - totalInvested;
  
  // Calculate daily profit
  const calculateDailyProfit = () => {
    let dailyTotal = 0;
    
    activeInvestments.forEach(inv => {
      const product = products?.find(p => p.id === inv.productId);
      if (product) {
        dailyTotal += (inv.amount * (product.growthRate / 100));
      }
    });
    
    return dailyTotal;
  };

  const dailyProfit = calculateDailyProfit();
  
  // Helper function to determine the status badge for an investment
  const getInvestmentStatusBadge = (investment: Investment) => {
    if (investment.status === 'active') {
      // If active but past end date, show as expired
      if (investment.endDate && new Date(investment.endDate) < new Date()) {
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else if (investment.status === 'completed') {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          Cancelled
        </Badge>
      );
    }
  };

  return (
    <UserLayout>
      <div className="container py-8">
        <Heading
          title="Investments"
          description="Manage your investments and explore new opportunities"
          icon={<TrendingUp className="h-6 w-6" />}
        />

        <div className="mb-8">
          <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="products">Investment Products</TabsTrigger>
              <TabsTrigger value="my-investments">
                My Investments
                {userInvestments.length > 0 && (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {userInvestments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Investment Products Tab */}
            <TabsContent value="products">
              <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                <h2 className="text-lg font-medium mb-2">Your Investment Profile</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Available Balance:</span>
                    <span className="ml-2 font-bold">${user.balance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total Invested:</span>
                    <span className="ml-2 font-bold">${user.totalInvested.toFixed(2)}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  All products are designed to double your investment over their duration. Fixed investment amounts with varying risk levels.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <InvestmentCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* My Investments Tab */}
            <TabsContent value="my-investments">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Invested</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${totalInvested.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Across {activeInvestments.length} active investments
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${currentInvestmentValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
                      </span> total profit
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Daily Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">+${dailyProfit.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Estimated earnings per day</p>
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : userInvestments.length > 0 ? (
                <>
                  {activeInvestments.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Active Investments</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {activeInvestments.map((investment) => {
                          const investmentProduct = products?.find(p => p.id === investment.productId);
                          return (
                            <ActiveInvestmentCard 
                              key={investment.id}
                              investment={investment}
                              product={investmentProduct}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  {completedInvestments.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Completed & Expired Investments</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {completedInvestments.map((investment) => {
                          const product = products?.find(p => p.id === investment.productId);
                          return (
                            <Card key={investment.id}>
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">
                                    {product?.name || "Investment"}
                                  </CardTitle>
                                  {getInvestmentStatusBadge(investment)}
                                </div>
                                <CardDescription>
                                  ${investment.amount.toFixed(2)} • {investment.endDate ? new Date(investment.endDate).toLocaleDateString() : 'No end date'}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Initial investment:</span>
                                  <span>${investment.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Final value:</span>
                                  <span>${investment.finalValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Total profit:</span>
                                  <span className="text-green-600">
                                    +${(investment.finalValue - investment.amount).toFixed(2)}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  {otherInvestments.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Other Investments</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherInvestments.map((investment) => {
                          const product = products?.find(p => p.id === investment.productId);
                          return (
                            <Card key={investment.id}>
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">
                                    {product?.name || "Investment"}
                                  </CardTitle>
                                  {getInvestmentStatusBadge(investment)}
                                </div>
                                <CardDescription>
                                  ${investment.amount.toFixed(2)} • Status: {investment.status}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Initial investment:</span>
                                  <span>${investment.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Current value:</span>
                                  <span>${investment.currentValue.toFixed(2)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-16 border border-dashed rounded-lg">
                  <div className="mb-3 inline-flex p-3 bg-muted rounded-full">
                    <CircleDollarSign className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Active Investments</h3>
                  <p className="text-muted-foreground mb-6">You don't have any active investments yet.</p>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    onClick={() => setActiveTab("products")}
                  >
                    Explore Investment Plans
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UserLayout>
  );
};

export default InvestmentsPage;
