
import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function BindTrc20AddressForm() {
  const { user, updateTrc20Address } = useAuth();
  
  const [trc20Address, setTrc20Address] = useState(user?.trc20Address || "");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!trc20Address.trim()) {
      toast.error("Please enter a valid TRC20 address");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await updateTrc20Address(trc20Address, withdrawalPassword || undefined);
      toast.success("Your TRC20 address has been updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update TRC20 address");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Withdrawal Address</h3>
          <p className="text-sm text-muted-foreground">Set your TRC20 address to receive withdrawals</p>
        </div>

        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertDescription>
            Make sure to enter a valid TRC20 (USDT) address. Withdrawals sent to incorrect addresses cannot be recovered.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trc20Address">TRC20 Address (USDT)</Label>
            <Input
              id="trc20Address"
              placeholder="Enter your TRC20 address"
              value={trc20Address}
              onChange={(e) => setTrc20Address(e.target.value)}
              className="font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalPassword">Withdrawal Password (Optional)</Label>
            <Input
              id="withdrawalPassword"
              type="password"
              placeholder="For additional security"
              value={withdrawalPassword}
              onChange={(e) => setWithdrawalPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Setting a withdrawal password adds an extra security layer
            </p>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {user.trc20Address ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
