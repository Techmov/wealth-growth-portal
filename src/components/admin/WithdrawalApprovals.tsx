
import { useState, useEffect } from "react";
import { WithdrawalRequest } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WithdrawalApprovals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    // In a real app, fetch pending withdrawals from backend
    // For now, check localStorage first or use mock data
    const storedWithdrawals = localStorage.getItem("pendingWithdrawals");
    if (storedWithdrawals) {
      setWithdrawals(JSON.parse(storedWithdrawals));
    } else {
      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: "withdrawal-1",
          userId: "user-1",
          amount: 500,
          status: "pending",
          date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          trc20Address: "TXyz123..."
        },
        {
          id: "withdrawal-2",
          userId: "user-2",
          amount: 1200,
          status: "pending",
          date: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
          trc20Address: "TAbc456..."
        },
        {
          id: "withdrawal-3",
          userId: "user-3",
          amount: 350,
          status: "pending",
          date: new Date(Date.now() - 1000 * 60 * 60 * 14), // 14 hours ago
          trc20Address: "TDef789..."
        }
      ];
      
      setWithdrawals(mockWithdrawals);
      localStorage.setItem("pendingWithdrawals", JSON.stringify(mockWithdrawals));
    }
  }, []);

  const handleApprove = (withdrawalId: string) => {
    if (!txHash.trim()) {
      toast({
        title: "Error",
        description: "Please provide a transaction hash.",
        variant: "destructive"
      });
      return;
    }
    
    // Find the withdrawal to approve
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return;
    
    // Update withdrawal status
    const updatedWithdrawals: WithdrawalRequest[] = withdrawals.map(w => 
      w.id === withdrawalId 
        ? { ...w, status: "approved" as const, txHash } 
        : w
    );
    
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem("pendingWithdrawals", JSON.stringify(updatedWithdrawals));
    
    // Update admin stats
    const currentStats = JSON.parse(localStorage.getItem("adminStats") || "{}");
    const newStats = {
      ...currentStats,
      totalWithdrawals: (currentStats.totalWithdrawals || 0) + withdrawal.amount,
      pendingWithdrawals: Math.max(0, (currentStats.pendingWithdrawals || 0) - 1)
    };
    localStorage.setItem("adminStats", JSON.stringify(newStats));
    
    // Dispatch event for stats update
    window.dispatchEvent(new CustomEvent("withdrawalStatusChange"));
    
    setTxHash("");
    
    toast({
      title: "Withdrawal Approved",
      description: `Withdrawal #${withdrawalId} has been approved.`,
    });
  };

  const openRejectDialog = (withdrawalId: string) => {
    setSelectedWithdrawal(withdrawalId);
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (!selectedWithdrawal) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }
    
    // Update withdrawal status
    const updatedWithdrawals: WithdrawalRequest[] = withdrawals.map(w => 
      w.id === selectedWithdrawal 
        ? { ...w, status: "rejected" as const, rejectionReason } 
        : w
    );
    
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem("pendingWithdrawals", JSON.stringify(updatedWithdrawals));
    
    // Update admin stats
    const currentStats = JSON.parse(localStorage.getItem("adminStats") || "{}");
    const newStats = {
      ...currentStats,
      pendingWithdrawals: Math.max(0, (currentStats.pendingWithdrawals || 0) - 1)
    };
    localStorage.setItem("adminStats", JSON.stringify(newStats));
    
    // Dispatch event for stats update
    window.dispatchEvent(new CustomEvent("withdrawalStatusChange"));
    
    setRejectDialogOpen(false);
    setSelectedWithdrawal(null);
    setRejectionReason("");
    
    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal has been rejected with reason provided.`,
    });
  };

  const pendingWithdrawals = withdrawals.filter(withdrawal => withdrawal.status === "pending");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Withdrawals ({pendingWithdrawals.length})</h3>
      
      {pendingWithdrawals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No pending withdrawals to approve
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TRC20 Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>TX Hash</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{withdrawal.userId}</TableCell>
                  <TableCell>${withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">{withdrawal.trc20Address}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(withdrawal.date), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Input 
                      placeholder="Enter TX hash"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="max-w-xs font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprove(withdrawal.id)}
                        className="text-green-500"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openRejectDialog(withdrawal.id)}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Reason for rejection</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a reason for rejecting this withdrawal request..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject Withdrawal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
