
import { useState } from "react";
import { WithdrawalRequest } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ApprovalDialogProps {
  open: boolean;
  withdrawal: WithdrawalRequest | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (txHash: string) => void;
}

export function ApprovalDialog({
  open,
  withdrawal,
  onOpenChange,
  onConfirm
}: ApprovalDialogProps) {
  const [txHash, setTxHash] = useState('');

  // Format withdrawal source for display
  const formatSource = (source?: string) => {
    if (!source) return "Profit";
    return source === "profit" ? "Profit" : "Referral Bonus";
  };

  const getSourceColor = (source?: string) => {
    if (!source || source === "profit") return "bg-blue-50 text-blue-700";
    return "bg-green-50 text-green-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Withdrawal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {withdrawal && (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">User:</p>
                <p>{withdrawal.userName || withdrawal.username || "Unknown"}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Amount:</p>
                <div className="flex items-center">
                  <p className="font-bold mr-2">${withdrawal.amount.toFixed(2)}</p>
                  <Badge variant="outline" className={`text-xs ${getSourceColor(withdrawal.withdrawalSource)}`}>
                    {formatSource(withdrawal.withdrawalSource)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">TRC20 Address:</p>
                <p className="font-mono text-xs break-all">{withdrawal.trc20Address}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tx-hash">Transaction Hash (Optional)</Label>
                <Input 
                  id="tx-hash" 
                  placeholder="Enter transaction hash" 
                  value={txHash} 
                  onChange={(e) => setTxHash(e.target.value)} 
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm(txHash)}>Confirm Approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
