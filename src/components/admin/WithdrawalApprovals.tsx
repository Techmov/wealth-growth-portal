
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingWithdrawals();
    
    // Set up real-time subscription for withdrawal requests
    const channel = supabase
      .channel('admin-withdrawals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'withdrawal_requests' },
        () => fetchPendingWithdrawals()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingWithdrawals = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'pending')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }

      if (data) {
        const formattedWithdrawals: WithdrawalRequest[] = data.map(wr => ({
          id: wr.id,
          userId: wr.user_id,
          amount: wr.amount,
          status: wr.status as 'pending',
          date: new Date(wr.date || Date.now()),
          trc20Address: wr.trc20_address,
          txHash: wr.tx_hash,
          rejectionReason: wr.rejection_reason
        }));
        
        setWithdrawals(formattedWithdrawals);
      }
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      toast({
        title: "Error",
        description: "Failed to load pending withdrawals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
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

      // Update withdrawal request status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'approved',
          tx_hash: txHash
        })
        .eq('id', withdrawalId);

      if (withdrawalError) throw withdrawalError;

      // Create a transaction record for the withdrawal
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: withdrawal.userId,
          type: 'withdrawal',
          amount: -withdrawal.amount, // Negative as it's money leaving
          status: 'completed',
          trc20_address: withdrawal.trc20Address,
          tx_hash: txHash,
          description: 'Withdrawal approved by admin'
        });

      if (transactionError) throw transactionError;

      // Update user total_withdrawn amount
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_withdrawn: supabase.rpc('increment', { row_id: withdrawal.userId, amount: withdrawal.amount }),
        })
        .eq('id', withdrawal.userId);

      if (profileError) throw profileError;
      
      // Update local state
      setWithdrawals(withdrawals.filter(w => w.id !== withdrawalId));
      setTxHash("");
      
      toast({
        title: "Withdrawal Approved",
        description: `Withdrawal has been approved with transaction hash.`,
      });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive"
      });
    }
  };

  const openRejectDialog = (withdrawalId: string) => {
    setSelectedWithdrawal(withdrawalId);
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    try {
      if (!selectedWithdrawal) return;
      
      if (!rejectionReason.trim()) {
        toast({
          title: "Error",
          description: "Please provide a reason for rejection.",
          variant: "destructive"
        });
        return;
      }
      
      // Find the withdrawal to reject
      const withdrawal = withdrawals.find(w => w.id === selectedWithdrawal);
      if (!withdrawal) return;

      // Update withdrawal request status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedWithdrawal);

      if (withdrawalError) throw withdrawalError;

      // Update user balance by adding the funds back
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: supabase.rpc('increment', { row_id: withdrawal.userId, amount: withdrawal.amount }),
        })
        .eq('id', withdrawal.userId);

      if (profileError) throw profileError;

      // Create a transaction record for the rejected withdrawal
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: withdrawal.userId,
          type: 'withdrawal',
          amount: withdrawal.amount, // Positive as money is returning to balance
          status: 'rejected',
          trc20_address: withdrawal.trc20Address,
          description: 'Withdrawal rejected by admin',
          rejection_reason: rejectionReason
        });

      if (transactionError) throw transactionError;
      
      // Update local state
      setWithdrawals(withdrawals.filter(w => w.id !== selectedWithdrawal));
      setRejectDialogOpen(false);
      setSelectedWithdrawal(null);
      setRejectionReason("");
      
      toast({
        title: "Withdrawal Rejected",
        description: `Withdrawal has been rejected and funds returned to user's balance.`,
      });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Withdrawals ({withdrawals.length})</h3>
      
      {isLoading ? (
        <div className="text-center py-8">Loading withdrawals...</div>
      ) : withdrawals.length === 0 ? (
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
              {withdrawals.map((withdrawal) => (
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
