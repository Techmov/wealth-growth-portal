
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowDown, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWithdrawalStats } from "@/hooks/useWithdrawalStats";

export function WithdrawalForm() {
  const navigate = useNavigate();
  const { user, requestWithdrawal } = useAuth();
  const { stats, isLoading: statsLoading } = useWithdrawalStats(user);
  
  const [amount, setAmount] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [withdrawalSource, setWithdrawalSource] = useState<'profit' | 'referral_bonus'>('profit');
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
    
    if (withdrawalAmount < 10) {
      toast.error("Minimum withdrawal amount is 10 USDT");
      return;
    }
    
    // Validate source-specific balance
    if (withdrawalSource === 'profit' && withdrawalAmount > stats.profitAmount) {
      toast.error("Insufficient profit funds for withdrawal", {
        description: `Available: $${stats.profitAmount.toFixed(2)}`
      });
      return;
    }
    
    if (withdrawalSource === 'referral_bonus' && withdrawalAmount > stats.referralBonus) {
      toast.error("Insufficient referral bonus funds for withdrawal", {
        description: `Available: $${stats.referralBonus.toFixed(2)}`
      });
      return;
    }
    
    if (!user.trc20Address) {
      toast.error("No withdrawal address set", {
        description: "Please set your TRC20 address in profile settings first",
        action: {
          label: "Set Address",
          onClick: () => navigate("/profile"),
        }
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await requestWithdrawal(withdrawalAmount, user.trc20Address, withdrawalSource, withdrawalPassword || undefined);
      setAmount("");
      setWithdrawalPassword("");
      toast.success("Withdrawal request submitted successfully", {
        description: "An admin will process your withdrawal within 24 hours"
      });
    } catch (error: any) {
      toast.error("Withdrawal request failed", {
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate disabled state
  const isButtonDisabled = isProcessing || 
    !user.trc20Address || 
    statsLoading || 
    !amount ||
    parseFloat(amount) <= 0 ||
    (withdrawalSource === 'profit' && parseFloat(amount) > stats.profitAmount) ||
    (withdrawalSource === 'referral_bonus' && parseFloat(amount) > stats.referralBonus) ||
    (user.withdrawalPassword && !withdrawalPassword);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Request Withdrawal</h3>
          <p className="text-sm text-muted-foreground">Withdraw funds to your TRC20 wallet</p>
        </div>

        {!user.trc20Address && (
          <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertDescription className="flex flex-col space-y-2">
              <p>Please set your TRC20 address in your profile before requesting a withdrawal.</p>
              <Button 
                variant="outline" 
                size="sm"
                className="self-start"
                onClick={() => navigate("/profile")}
              >
                Go to Profile Settings
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
              <div className="text-sm">Available for Withdrawal</div>
              <div className="font-semibold">${stats.availableWithdrawal.toFixed(2)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={`px-3 py-2 rounded-md transition-colors ${withdrawalSource === 'profit' ? 'bg-blue-100 border border-blue-200' : 'bg-blue-50'}`}>
                <div className="text-sm text-blue-700">Profit</div>
                <div className="font-semibold">${stats.profitAmount.toFixed(2)}</div>
              </div>
              <div className={`px-3 py-2 rounded-md transition-colors ${withdrawalSource === 'referral_bonus' ? 'bg-green-100 border border-green-200' : 'bg-green-50'}`}>
                <div className="text-sm text-green-700">Referral Bonus</div>
                <div className="font-semibold">${stats.referralBonus.toFixed(2)}</div>
              </div>
            </div>

            <div className="px-3 py-2 bg-orange-50 rounded-md flex justify-between">
              <div className="text-sm text-orange-700">In Escrow (Pending)</div>
              <div className="font-semibold">${stats.escrowedAmount.toFixed(2)}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <Label>Withdrawal Source</Label>
            <RadioGroup 
              value={withdrawalSource} 
              onValueChange={(v) => setWithdrawalSource(v as 'profit' | 'referral_bonus')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="profit" id="profit" />
                <Label htmlFor="profit" className="cursor-pointer">Profit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="referral_bonus" id="referral_bonus" />
                <Label htmlFor="referral_bonus" className="cursor-pointer">Referral Bonus</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="10"
                step="1"
                placeholder="10"
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
              disabled={isButtonDisabled}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Request Withdrawal"}
            </Button>
          </div>
        </form>
        
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <p>Processing Time: 24 Hours</p>
          </div>
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
              <span>Only profits and referral bonuses can be withdrawn</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Pending withdrawal amounts are placed in escrow</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
