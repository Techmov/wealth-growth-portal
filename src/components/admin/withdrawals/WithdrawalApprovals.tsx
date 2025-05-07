
import { useState, useEffect } from "react";
import { WithdrawalRequest } from "@/types";
import { toast } from "sonner";
import { incrementValue } from "@/utils/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";
import { WithdrawalsTable } from "./WithdrawalsTable";
import { ApprovalDialog } from "./ApprovalDialog";
import { AdminLoader } from "../shared/AdminLoader";
import { EmptyState } from "../shared/EmptyState";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        (payload) => {
          console.log("Withdrawal change detected:", payload);
          fetchPendingWithdrawals();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("✅ WithdrawalApprovals connected to Supabase realtime");
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingWithdrawals = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching pending withdrawals...");
      
      const withdrawalRequests = await adminUtils.getPendingWithdrawals();
      
      if (withdrawalRequests && withdrawalRequests.length > 0) {
        console.log(`Found ${withdrawalRequests.length} pending withdrawals`);
        const formattedWithdrawals: WithdrawalRequest[] = withdrawalRequests.map(wr => {
          // Handle both nested profile data structure and flat structure
          let userName, userEmail, username;
          
          if (wr.profiles) {
            userName = wr.profiles.name;
            userEmail = wr.profiles.email;
            username = wr.profiles.username;
          } else if (wr.name) {
            // If data comes from the RPC function in flattened form
            userName = wr.name;
            userEmail = wr.email;
            username = wr.username;
          } else {
            userName = 'Unknown';
            userEmail = 'Unknown';
            username = 'Unknown';
          }
          
          return {
            id: wr.id,
            userId: wr.user_id,
            amount: wr.amount,
            status: wr.status as 'pending' | 'approved' | 'rejected',
            date: new Date(wr.date || Date.now()),
            trc20Address: wr.trc20_address,
            txHash: wr.tx_hash,
            rejectionReason: wr.rejection_reason,
            userName,
            userEmail,
            username
          };
        });
        
        setWithdrawals(formattedWithdrawals);
      } else {
        console.log("No pending withdrawals found");
        setWithdrawals([]);
      }
    } catch (error) {
      console.error("Error fetching pending withdrawals:", error);
      toast.error("Failed to load pending withdrawals");
      setWithdrawals([]);
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

  const handleRefresh = () => {
    fetchPendingWithdrawals();
    toast.success("Withdrawal data refreshed");
  };

  if (isLoading) {
    return <AdminLoader message="Loading withdrawal requests..." />;
  }

  if (withdrawals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Pending Withdrawals (0)</h3>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
        <EmptyState
          icon={<Check className="h-6 w-6 text-muted-foreground" />}
          message="No pending withdrawals to approve"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pending Withdrawals ({withdrawals.length})</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <WithdrawalsTable
          withdrawals={withdrawals}
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
