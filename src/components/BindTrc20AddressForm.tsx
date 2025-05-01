
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function BindTrc20AddressForm() {
  const { user, updateUser } = useAuth();
  const [trc20Address, setTrc20Address] = useState(user?.trc20Address || "");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [confirmWithdrawalPassword, setConfirmWithdrawalPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trc20Address.trim()) {
      toast.error("Please enter a valid TRC20 address");
      return;
    }
    
    if (withdrawalPassword !== confirmWithdrawalPassword) {
      toast.error("Withdrawal passwords do not match");
      return;
    }
    
    if (withdrawalPassword && withdrawalPassword.length < 6) {
      toast.error("Withdrawal password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, this would be updated in the database
      await updateUser({
        ...user,
        trc20Address,
        withdrawalPassword,
      });
      
      toast.success("TRC20 address and withdrawal password updated successfully!");
    } catch (error) {
      console.error("Error updating TRC20 address:", error);
      toast.error("Failed to update TRC20 address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trc20Address">TRC20 Address (USDT)</Label>
        <Input
          id="trc20Address"
          value={trc20Address}
          onChange={(e) => setTrc20Address(e.target.value)}
          placeholder="Enter your TRC20 address"
          className="w-full"
          required
        />
        <p className="text-xs text-muted-foreground">
          This address will be used for withdrawals
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="withdrawalPassword">
          Withdrawal Password {user?.withdrawalPassword && "(Already Set)"}
        </Label>
        <Input
          id="withdrawalPassword"
          type={showPassword ? "text" : "password"}
          value={withdrawalPassword}
          onChange={(e) => setWithdrawalPassword(e.target.value)}
          placeholder={user?.withdrawalPassword ? "Update withdrawal password (optional)" : "Create withdrawal password"}
          className="w-full"
          required={!user?.withdrawalPassword}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmWithdrawalPassword">Confirm Withdrawal Password</Label>
        <Input
          id="confirmWithdrawalPassword"
          type={showPassword ? "text" : "password"}
          value={confirmWithdrawalPassword}
          onChange={(e) => setConfirmWithdrawalPassword(e.target.value)}
          placeholder="Confirm withdrawal password"
          className="w-full"
          required={!user?.withdrawalPassword || withdrawalPassword.length > 0}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="showPassword" className="text-sm cursor-pointer">
          Show password
        </Label>
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save TRC20 Address"
          )}
        </Button>
      </div>
    </form>
  );
}
