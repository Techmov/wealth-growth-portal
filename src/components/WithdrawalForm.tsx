import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Clock, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWithdrawalStats } from "@/hooks/useWithdrawalStats";
import { WithdrawalRequirementsAlert } from "./WithdrawalRequirementsAlert";
import { WithdrawalButton } from "./WithdrawalButton";

// Withdrawal fee constant
const WITHDRAWAL_FEE = 0;

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
    
    console.log("Withdrawal form submitted", { 
      amount, 
      withdrawalSource, 
      trc20Address: user.trc20Address,
      stats 
    });
    
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (withdrawalAmount < 10) {
      toast.error("Minimum withdrawal amount is 10 USDT");
      return;
    }
    
    // Check if amount exceeds available balance
    if (withdrawalSource === 'profit' && withdrawalAmount > stats.profitAmount) {
      toast.error("Insufficient profit funds for withdrawal", {
        description: `Available profit: $${stats.profitAmount.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
      });
      return;
    }
    
    if (withdrawalSource === 'referral_bonus' && withdrawalAmount > stats.referralBonus) {
      toast.error("Insufficient referral bonus funds for withdrawal", {
        description: `Available bonus: $${stats.referralBonus.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
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
      console.log("Calling requestWithdrawal with:", {
        amount: withdrawalAmount,
        trc20Address: user.trc20Address,
        withdrawalSource,
        withdrawalPassword: withdrawalPassword || undefined
      });
      
      await requestWithdrawal(withdrawalAmount, user.trc20Address, withdrawalSource, withdrawalPassword || undefined);
      setAmount("");
      setWithdrawalPassword("");
      toast.success("Withdrawal request submitted successfully", {
        description: "An admin will process your withdrawal within 24 hours"
      });
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error("Withdrawal request failed", {
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate validation states
  const amountValue = parseFloat(amount);
  const isValidAmount = !isNaN(amountValue) && amountValue >= 10;
  const hasRequiredPassword = !user.withdrawalPassword || withdrawalPassword.length > 0;
  const hasRequiredSetup = !!user.trc20Address && hasRequiredPassword;
  const hasSufficientFunds = 
    (withdrawalSource === 'profit' && amountValue <= stats.profitAmount) ||
    (withdrawalSource === 'referral_bonus' && amountValue <= stats.referralBonus);

  // Calculate total amount including fee
  const actualReceiveAmount = isValidAmount ? amountValue + WITHDRAWAL_FEE : 0;
  const totalDeducted = isValidAmount ? amountValue : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Request Withdrawal</h3>
          <p className="text-sm text-muted-foreground">Withdraw funds to your TRC20 wallet</p>
        </div>

        <WithdrawalRequirementsAlert 
          hasTrc20Address={!!user.trc20Address}
          hasWithdrawalPassword={!!user.withdrawalPassword}
        />

        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-3 py-2 bg-primary/10 rounded-md border">
              <div className="text-sm font-medium">Available for Withdrawal</div>
              <div className="font-bold text-lg text-primary">${stats.availableWithdrawal.toFixed(2)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className={`px-3 py-2 rounded-md transition-colors ${withdrawalSource === 'profit' ? 'bg-blue-100 border border-blue-200 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-100' : 'bg-blue-50 dark:bg-blue-950 dark:text-blue-200'}`}>
                <div className={`text-sm ${withdrawalSource === 'profit' ? 'text-blue-700 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300'}`}>Profit</div>
                <div className="font-semibold">${stats.profitAmount.toFixed(2)}</div>
              </div>
              <div className={`px-3 py-2 rounded-md transition-colors ${withdrawalSource === 'referral_bonus' ? 'bg-green-100 border border-green-200 dark:bg-green-900 dark:border-green-800 dark:text-green-100' : 'bg-green-50 dark:bg-green-950 dark:text-green-200'}`}>
                <div className={`text-sm ${withdrawalSource === 'referral_bonus' ? 'text-green-700 dark:text-green-100' : 'text-green-700 dark:text-green-300'}`}>Referral Bonus</div>
                <div className="font-semibold">${stats.referralBonus.toFixed(2)}</div>
              </div>
            </div>

            <div className="px-3 py-2 bg-orange-50 dark:bg-orange-950 dark:text-orange-200 rounded-md flex justify-between">
              <div className="text-sm text-orange-700 dark:text-orange-300">In Escrow (Pending)</div>
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
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">Minimum withdrawal amount: $10</p>
              <p className="text-xs text-muted-foreground">Fee: $0.00</p>
            </div>
            
            <Alert className="bg-muted/50 mt-2 py-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-muted-foreground" />
                <div className="flex justify-between w-full items-center">
                  <span className="text-xs">You will receive:</span>
                  <span className="text-xs font-medium">
                    ${actualReceiveAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Info size={16} className="text-muted-foreground opacity-0" />
                <div className="flex justify-between w-full items-center">
                  <span className="text-xs">Total deducted:</span>
                  <span className="text-xs font-medium">
                    ${totalDeducted.toFixed(2)}
                  </span>
                </div>
              </div>
            </Alert>
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
            <WithdrawalButton
              isProcessing={isProcessing}
              isValidAmount={isValidAmount}
              hasRequiredSetup={hasRequiredSetup}
              hasSufficientFunds={hasSufficientFunds}
              onSubmit={handleWithdraw}
            />
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
              <span>A withdrawal fee of $3 is applied to all withdrawals</span>
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
