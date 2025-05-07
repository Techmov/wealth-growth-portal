
import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function WithdrawalForm() {
  const { user, requestWithdrawal } = useAuth();
  
  const [amount, setAmount] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return null;
  }

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (withdrawalAmount > user.balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    if (!user.trc20Address) {
      toast.error("Please set your TRC20 withdrawal address in your profile first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await requestWithdrawal(withdrawalAmount, user.trc20Address, withdrawalPassword || undefined);
      setAmount("");
      setWithdrawalPassword("");
      toast.success("Withdrawal request submitted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to process withdrawal request");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Request Withdrawal</h3>
          <p className="text-sm text-muted-foreground">Withdraw funds to your TRC20 wallet</p>
        </div>

        {!user.trc20Address && (
          <Alert variant="destructive" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertDescription>
              Please set your TRC20 address in your profile before requesting a withdrawal.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
          <div className="text-sm">Available Balance</div>
          <div className="font-semibold">${user.balance.toFixed(2)}</div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="10"
                step="10"
                placeholder="100"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum withdrawal amount: $10</p>
          </div>

          {user.withdrawalPassword && (
            <div className="space-y-2">
              <Label htmlFor="withdrawalPassword">Withdrawal Password</Label>
              <Input
                id="withdrawalPassword"
                type="password"
                placeholder="Enter your withdrawal password"
                value={withdrawalPassword}
                onChange={(e) => setWithdrawalPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !user.trc20Address}
            >
              {isProcessing ? "Processing..." : "Request Withdrawal"}
            </Button>
          </div>
        </form>
        
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium">Withdrawal Information</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Withdrawals are processed manually within 24 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>You will receive funds to your registered TRC20 address</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Contact support if you don't receive funds after 48 hours</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
