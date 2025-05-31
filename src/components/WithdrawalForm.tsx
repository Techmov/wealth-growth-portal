import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useWithdrawalStats } from "@/hooks/useWithdrawalStats";
import { WithdrawalRequirementsAlert } from "./WithdrawalRequirementsAlert";

const WITHDRAWAL_FEE = 0;

export function WithdrawalForm() {
  const navigate = useNavigate();
  const { user, requestWithdrawal } = useAuth();
  const { stats, isLoading: statsLoading } = useWithdrawalStats(user);

  const [amount, setAmount] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [withdrawalSource, setWithdrawalSource] = useState<'profit' | 'referral_bonus' | 'available'>('profit');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;

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

    const insufficientMsg = {
      profit: `Available profit: $${stats.profitAmount.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`,
      referral_bonus: `Available bonus: $${stats.referralBonus.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`,
      available: `Available balance: $${stats.availableBalance.toFixed(2)}, Requested: $${withdrawalAmount.toFixed(2)}`
    };

    const availableCheck = {
      profit: stats.profitAmount,
      referral_bonus: stats.referralBonus,
      available: stats.availableBalance
    };

    if (withdrawalAmount > availableCheck[withdrawalSource]) {
      toast.error("Insufficient funds for withdrawal", { description: insufficientMsg[withdrawalSource] });
      return;
    }

    if (!user.trc20Address) {
      toast.error("No withdrawal address set", {
        description: "Please set your TRC20 address in profile settings first",
        action: {
          label: "Set Address",
          onClick: () => navigate("/profile"),
        },
      });
      return;
    }

    setIsProcessing(true);
    try {
      await requestWithdrawal(
        withdrawalAmount,
        user.trc20Address,
        withdrawalSource,
        withdrawalPassword || undefined
      );
      setAmount("");
      setWithdrawalPassword("");
      toast.success("Withdrawal request submitted successfully", {
        description: "An admin will process your withdrawal within 24 hours",
      });
    } catch (error: any) {
      toast.error("Withdrawal request failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const amountValue = parseFloat(amount);
  const isValidAmount = !isNaN(amountValue) && amountValue >= 10;
  const hasRequiredPassword = !user.withdrawalPassword || withdrawalPassword.length > 0;
  const hasRequiredSetup = !!user.trc20Address && hasRequiredPassword;

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
            {/* Updated to use availableBalance */}
            <div className="flex items-center justify-between px-3 py-2 bg-primary/10 rounded-md border">
              <div className="text-sm font-medium">Available for Withdrawal</div>
              <div className="font-bold text-lg text-primary">${stats.availableBalance.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`px-3 py-2 rounded-md ${withdrawalSource === 'profit' ? 'bg-blue-100 border border-blue-200' : 'bg-blue-50'}`}>
                <div className="text-sm">Profit</div>
                <div className="font-semibold">${stats.profitAmount.toFixed(2)}</div>
              </div>
              <div className={`px-3 py-2 rounded-md ${withdrawalSource === 'referral_bonus' ? 'bg-green-100 border border-green-200' : 'bg-green-50'}`}>
                <div className="text-sm">Referral Bonus</div>
                <div className="font-semibold">${stats.referralBonus.toFixed(2)}</div>
              </div>
              <div className={`px-3 py-2 rounded-md ${withdrawalSource === 'available' ? 'bg-yellow-100 border border-yellow-200' : 'bg-yellow-50'}`}>
                <div className="text-sm">Available</div>
                <div className="font-semibold">${stats.availableBalance.toFixed(2)}</div>
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
              onValueChange={(v) => setWithdrawalSource(v as any)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="profit" id="profit" />
                <Label htmlFor="profit">Profit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="referral_bonus" id="referral_bonus" />
                <Label htmlFor="referral_bonus">Referral Bonus</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available" />
                <Label htmlFor="available">Available</Label>
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
              <div className="flex justify-between text-xs">
                <span>You will receive:</span>
                <span className="font-medium">${actualReceiveAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Total deducted:</span>
                <span className="font-medium">${totalDeducted.toFixed(2)}</span>
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
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isValidAmount || !hasRequiredSetup || isProcessing}
            className="w-full bg-primary text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>
    </Card>
  );
    }
    
