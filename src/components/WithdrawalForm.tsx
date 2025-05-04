
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BindTrc20AddressForm } from "./BindTrc20AddressForm";

export function WithdrawalForm() {
  const { user, requestWithdrawal } = useAuth();
  const [amount, setAmount] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.trc20Address) {
      toast.error("Please bind your TRC20 address first");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (Number(amount) > (user?.balance || 0)) {
      toast.error("Withdrawal amount exceeds your available balance");
      return;
    }
    
    if (!withdrawalPassword) {
      toast.error("Please enter your withdrawal password");
      return;
    }
    
    // Verify the withdrawal password matches the transaction hash
    if (withdrawalPassword !== user?.withdrawalPassword) {
      toast.error("Incorrect withdrawal password");
      return;
    }
    
    try {
      setLoading(true);
      
      // Process the withdrawal request
      await requestWithdrawal(Number(amount));
      
      toast.success("Withdrawal request submitted successfully!");
      
      // Reset form
      setAmount("");
      setWithdrawalPassword("");
      
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Failed to process withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.trc20Address || !user?.withdrawalPassword) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
            TRC20 Address Required
          </h3>
          <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-400">
            Please bind your TRC20 address and set a withdrawal password before making a withdrawal.
          </p>
        </div>
        
        <BindTrc20AddressForm />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trc20Address">Your TRC20 Address</Label>
        <Input
          id="trc20Address"
          value={user.trc20Address}
          readOnly
          className="w-full bg-muted"
        />
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="link" 
            size="sm" 
            className="px-0 h-auto"
            onClick={() => toast.info("Contact support to change your TRC20 address")}
          >
            Need to change?
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Withdrawal Amount (USDT)</Label>
          <span className="text-sm text-muted-foreground">
            Available: {user?.balance.toFixed(2)} USDT
          </span>
        </div>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          max={user?.balance}
          className="w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="withdrawalPassword">
          Transaction Hash / Withdrawal Password
          {user.withdrawalPassword && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Your password: {user.withdrawalPassword})
            </span>
          )}
        </Label>
        <Input
          id="withdrawalPassword"
          type="password"
          value={withdrawalPassword}
          onChange={(e) => setWithdrawalPassword(e.target.value)}
          placeholder="Enter your transaction hash"
          className="w-full"
          required
        />
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting Withdrawal...
            </>
          ) : (
            "Request Withdrawal"
          )}
        </Button>
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Withdrawal requests are processed manually within 24-48 hours
        </p>
      </div>
    </form>
  );
}
