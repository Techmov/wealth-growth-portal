
import { useState, useEffect } from "react";
import { WithdrawalRequest } from "@/types";
import { toast } from "sonner";
import { incrementValue } from "@/utils/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";
import { WithdrawalsTable } from "./WithdrawalsTable";
import { ApprovalDialog } from "./ApprovalDialog";

interface WithdrawalApprovalsProps {
  onStatusChange?: () => void;
}

export function WithdrawalApprovals({ onStatusChange }: WithdrawalApprovalsProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);

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
          userName: wr.name || 'Unknown',
          userEmail: wr.email || 'Unknown',
          username: wr.username || 'Unknown'
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
    setApprovalDialogOpen(true);
  };

  const handleApproval = async (txHash: string) => {
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
      
      <div className="border rounded-md overflow-x-auto">
        <WithdrawalsTable
          withdrawals={withdrawals}
          isLoading={isLoading}
          onApprove={handleApprovalDialogOpen}
          onReject={handleReject}
        />
      </div>
      
      <ApprovalDialog
        open={approvalDialogOpen}
        withdrawal={selectedWithdrawal}
        onOpenChange={setApprovalDialogOpen}
        onConfirm={handleApproval}
      />
    </div>
  );
}
