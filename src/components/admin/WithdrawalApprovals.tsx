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
import { formatDistanceToNow } from "date-fns";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { incrementValue } from "@/utils/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";

interface WithdrawalApprovalsProps {
  onStatusChange?: () => void;
}

export function WithdrawalApprovals({ onStatusChange }: WithdrawalApprovalsProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    fetchPendingWithdrawals();
    
    // Set up real-time subscription for withdrawal_requests
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
      console.log("Fetching pending withdrawals...");
      
      const withdrawalRequests = await adminUtils.getPendingWithdrawals();
      
      if (withdrawalRequests) {
        console.log(`Found ${withdrawalRequests.length} pending withdrawals`);
        const formattedWithdrawals: WithdrawalRequest[] = withdrawalRequests.map(wr => ({
          id: wr.id,
          userId: wr.user_id,
          amount: wr.amount,
          status: wr.status as 'pending' | 'approved' | 'rejected',
          date: new Date(wr.date || Date.now()),
          trc20Address: wr.trc20_address,
          txHash: wr.tx_hash,
          rejectionReason: wr.rejection_reason,
          userName: wr.profiles?.name || 'Unknown',
          userEmail: wr.profiles?.email || 'Unknown',
          username: wr.profiles?.username || 'Unknown'
        }));
        
        setWithdrawals(formattedWithdrawals);
      }
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      toast.error("Failed to load pending withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalDialogOpen = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setTxHash('');
    setApprovalDialogOpen(true);
  };

  const handleApproval = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedWithdrawal.userId,
          type: 'withdrawal',
          amount: -Math.abs(selectedWithdrawal.amount), // Negative for withdrawal
          status: 'completed',
          description: 'Withdrawal approved',
          trc20_address: selectedWithdrawal.trc20Address,
          tx_hash: txHash || undefined
        });

      if (transactionError) throw transactionError;

      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'approved',
          tx_hash: txHash || null
        })
        .eq('id', selectedWithdrawal.id);

      if (withdrawalError) throw withdrawalError;
      
      // Increment total_withdrawn on the user's profile
      await incrementValue(
        'profiles',
        'total_withdrawn',
        selectedWithdrawal.userId,
        selectedWithdrawal.amount
      );

      // Update local state
      setWithdrawals(withdrawals.filter(w => w.id !== selectedWithdrawal.id));
      
      toast.success("Withdrawal approved successfully");
      setApprovalDialogOpen(false);
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast.error("Failed to approve withdrawal");
    }
  };

  const handleReject = async (withdrawalId: string) => {
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return;
    
    try {
      // Refund the amount to user's balance
      await incrementValue(
        'profiles',
        'balance',
        withdrawal.userId,
        withdrawal.amount
      );
      
      // Update withdrawal status
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: 'Rejected by admin'
        })
        .eq('id', withdrawalId);

      if (error) throw error;
      
      // Update local state
      setWithdrawals(withdrawals.filter(w => w.id !== withdrawalId));
      
      toast.success("Withdrawal rejected and amount refunded to user's balance");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error("Failed to reject withdrawal");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Withdrawals ({withdrawals.length})</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
            <p className="text-sm text-muted-foreground">Loading withdrawals...</p>
          </div>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="border rounded-md flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Check className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>No pending withdrawals to approve</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TRC20 Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {withdrawal.userName || withdrawal.username || "Unknown"}
                  </TableCell>
                  <TableCell>{withdrawal.userEmail || "Unknown"}</TableCell>
                  <TableCell className="font-medium">${withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[160px] truncate">
                    {withdrawal.trc20Address}
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(withdrawal.date), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprovalDialogOpen(withdrawal)}
                        className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(withdrawal.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWithdrawal && (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">User:</p>
                  <p>{selectedWithdrawal.userName || selectedWithdrawal.username || "Unknown"}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Amount:</p>
                  <p className="font-bold">${selectedWithdrawal.amount.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">TRC20 Address:</p>
                  <p className="font-mono text-xs break-all">{selectedWithdrawal.trc20Address}</p>
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
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApproval}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
