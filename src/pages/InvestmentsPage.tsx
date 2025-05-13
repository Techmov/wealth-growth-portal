import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { InvestmentCard } from "@/components/InvestmentCard";
import { ActiveInvestmentCard } from "@/components/ActiveInvestmentCard";
import { Product } from "@/types";
import { TrendingUp, CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const InvestmentsPage = () => {
  const { user } = useAuth();
  const { products, userInvestments, isLoading, fetchUserInvestments } = useInvestment();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Fetch investments when switching to "myinvestments" tab
    if (activeTab === "myinvestments" && fetchUserInvestments) {
      fetchUserInvestments();
    }
  }, [user, navigate, activeTab, fetchUserInvestments]);

  if (!user) return null;

  // Use correct field names from DB (snake_case)
  const now = new Date();
  const activeInvestments = userInvestments?.filter(
    inv => inv.status === "active" && new Date(inv.endDate) > now
  ) || [];
  const completedInvestments = userInvestments?.filter(
    inv => inv.status === "completed" || new Date(inv.end_date) <= now
  ) || [];

  // Calculate total investment stats
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentInvestmentValue = activeInvestments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const totalProfit = currentInvestmentValue - totalInvested;

  // Calculate daily profit
  const calculateDailyProfit = () => {
    let dailyTotal = 0;
    activeInvestments.forEach(inv => {
      const product = products?.find(p => p.id === inv.product_id);
      if (product) {
        dailyTotal += (inv.amount * (product.growthRate / 100));
      }
    });
    return dailyTotal;
  };

  const dailyProfit = calculateDailyProfit();

  console.log("userInvestments", userInvestments);
  console.log("activeInvestments", activeInvestments);

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
              <TabsTrigger value="myinvestments">
                My Investments
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {activeInvestments.length}
                </span>
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
                  {products.map((product: Product) => (
                    <InvestmentCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Investments Tab */}
            <TabsContent value="myinvestments">
              {isLoading ? (
                <div>Loading...</div>
              ) : userInvestments && userInvestments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userInvestments.map((investment) => (
                    <Card key={investment.id}>
                      <CardHeader>
                        <CardTitle>
                          {products?.find(p => p.id === investment.product_id)?.name || "Investment"}
                        </CardTitle>
                        <CardDescription>
                          Invested: ${investment.starting_value?.toFixed(2) ?? investment.amount?.toFixed(2)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>
                            {investment.start_date
                              ? new Date(investment.start_date).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Date:</span>
                          <span>
                            {investment.end_date
                              ? new Date(investment.end_date).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Starting Amount:</span>
                          <span>${investment.starting_value?.toFixed(2) ?? investment.amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Value:</span>
                          <span>
                            ${(
                              investment.starting_value +
                              (investment.starting_value * investment.daily_growth_rate / 100 *
                                Math.max(
                                  Math.floor(
                                    (new Date() - new Date(investment.start_date)) /
                                      (1000 * 60 * 60 * 24)
                                  ), 1
                                )
                              )
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Daily Growth Rate:</span>
                          <span>+{investment.daily_growth_rate?.toFixed(2) ?? 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span>{investment.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You don't have any investments yet.
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
