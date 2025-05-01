
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { TransactionsList } from "@/components/TransactionsList";

const TransactionsPage = () => {
  const { user, deposit, withdraw } = useAuth();
  const { transactions } = useInvestment();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    try {
      setIsProcessing(true);
      await deposit(depositAmount);
      setAmount("");
    } catch (error: any) {
      setError(error.message || "Failed to process deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (withdrawalAmount > user.balance) {
      setError("Insufficient balance");
      return;
    }
    
    try {
      setIsProcessing(true);
      await withdraw(withdrawalAmount);
      setAmount("");
    } catch (error: any) {
      setError(error.message || "Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Deposits & Withdrawals</h1>
          <p className="text-muted-foreground">
            Manage your funds and track your transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
                <CardDescription>Available funds in your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${user.balance.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Deposit or Withdraw</CardTitle>
                <CardDescription>Move funds in or out of your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>
                  
                  {error && (
                    <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                      {error}
                    </div>
                  )}

                  <TabsContent value="deposit">
                    <form onSubmit={handleDeposit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount to Deposit</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="deposit-amount"
                            type="number"
                            min="10"
                            step="10"
                            placeholder="100"
                            className="pl-8"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Deposit Funds"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="withdraw">
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            min="10"
                            step="10"
                            max={user.balance}
                            placeholder="100"
                            className="pl-8"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Withdraw Funds"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your account activities</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsList transactions={transactions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TransactionsPage;
