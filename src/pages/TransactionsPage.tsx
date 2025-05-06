
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
import { WithdrawalsRequestList } from "@/components/WithdrawalsRequestList";
import { toast } from "@/components/ui/sonner";

const TransactionsPage = () => {
  const { user, deposit, requestWithdrawal } = useAuth();
  const { transactions, withdrawalRequests, platformTrc20Address } = useInvestment();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
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

  const handleManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (!txHash) {
      setError("Please enter your transaction hash");
      return;
    }
    
    try {
      setIsProcessing(true);
      await deposit(depositAmount, txHash);
      setAmount("");
      setTxHash("");
      toast.success("Deposit request submitted successfully. It will be reviewed by an admin.");
    } catch (error: any) {
      setError(error.message || "Failed to process deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
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
    
    if (!user.trc20Address) {
      setError("Please set your TRC20 withdrawal address in your profile before requesting a withdrawal");
      return;
    }
    
    try {
      setIsProcessing(true);
      // Fix: Pass the TRC20 address as second parameter
      await requestWithdrawal(withdrawalAmount, user.trc20Address);
      setAmount("");
      toast.success("Withdrawal request submitted. It will be processed by an admin.");
    } catch (error: any) {
      setError(error.message || "Failed to process withdrawal request");
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
                    <div className="p-3 mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded">
                      <p className="font-medium mb-1">How to Deposit:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Send USDT to our TRC20 address below</li>
                        <li>Enter the amount and transaction hash</li>
                        <li>Submit your deposit for review</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 mb-4 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-sm font-medium mb-1">Platform TRC20 Address:</p>
                      <p className="font-mono text-sm break-all">{platformTrc20Address}</p>
                    </div>
                    
                    <form onSubmit={handleManualDeposit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount Sent (USDT)</Label>
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="tx-hash">Transaction Hash</Label>
                        <Input
                          id="tx-hash"
                          placeholder="Enter your transaction hash"
                          className="font-mono"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          This helps us verify your deposit on the blockchain
                        </p>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Submit Deposit"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="withdraw">
                    {!user.trc20Address && (
                      <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded">
                        <p className="font-medium">No TRC20 address set!</p>
                        <p className="mt-1">
                          Please add your TRC20 address in your <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/profile")}>profile</Button> before requesting a withdrawal.
                        </p>
                      </div>
                    )}
                    
                    <form onSubmit={handleWithdrawRequest} className="space-y-4">
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
                      
                      <div className="p-3 mb-1 bg-gray-50 border border-gray-200 rounded text-sm">
                        <p className="font-medium">Withdrawal Information:</p>
                        <ul className="mt-1 space-y-1">
                          <li>• Withdrawals are processed manually by an admin</li>
                          <li>• Processing time: 1-2 business days</li>
                          <li>• Minimum withdrawal: $10</li>
                        </ul>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isProcessing || !user.trc20Address}>
                        {isProcessing ? "Processing..." : "Request Withdrawal"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions">
              <TabsList className="mb-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All your account activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionsList transactions={transactions} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="withdrawals">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Withdrawal Requests</CardTitle>
                    <CardDescription>Status of your withdrawal requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WithdrawalsRequestList withdrawalRequests={withdrawalRequests} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TransactionsPage;
