
import { useState, useEffect } from "react";
import { Transaction } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { incrementValue } from "@/utils/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";
import { DepositsTable } from "./DepositsTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DepositApprovalsProps {
  onStatusChange?: () => void;
}

export function DepositApprovals({ onStatusChange }: DepositApprovalsProps) {
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingDeposits();
    
    // Set up real-time subscription for transactions
    const channel = supabase
      .channel('admin-deposits-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log("Transaction change detected in DepositApprovals:", payload);
          fetchPendingDeposits();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("✅ DepositApprovals connected to Supabase realtime");
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching pending deposits...");
      
      const pendingDeposits = await adminUtils.getPendingDeposits();
      
      if (pendingDeposits && pendingDeposits.length > 0) {
        console.log(`Found ${pendingDeposits.length} pending deposits`);
        const formattedDeposits: Transaction[] = pendingDeposits.map(tx => ({
          id: tx.id,
          userId: tx.user_id,
          type: tx.type as 'deposit',
          amount: tx.amount,
          status: tx.status as 'pending',
          date: new Date(tx.date || Date.now()),
          description: tx.description,
          trc20Address: tx.trc20_address,
          txHash: tx.tx_hash,
          depositScreenshot: tx.deposit_screenshot,
          rejectionReason: tx.rejection_reason
        }));
        
        setDeposits(formattedDeposits);
      } else {
        console.log("No pending deposits found");
        setDeposits([]);
      }
    } catch (error) {
      console.error("Error fetching pending deposits:", error);
      toast.error("Failed to load pending deposits");
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      // Find the deposit to approve
      const deposit = deposits.find(d => d.id === depositId);
      if (!deposit) {
        toast.error("Deposit not found");
        return;
      }

      // Update transaction status
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', depositId);

      if (transactionError) throw transactionError;

      // Increment user balance
      try {
        await incrementValue('profiles', 'balance', deposit.userId, deposit.amount);
      } catch (incrementError) {
        console.error("Error incrementing balance:", incrementError);
        toast.error("Error adding funds to user balance");
        return;
      }
      
      // Update local state
      setDeposits(deposits.filter(d => d.id !== depositId));
      
      toast.success("Deposit approved successfully");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error approving deposit:", error);
      toast.error("Failed to approve deposit");
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      // Update transaction status
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'rejected',
          rejection_reason: 'Rejected by admin'
        })
        .eq('id', depositId);

      if (error) throw error;
      
      // Update local state
      setDeposits(deposits.filter(d => d.id !== depositId));
      
      toast.success("Deposit rejected successfully");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      toast.error("Failed to reject deposit");
    }
  };

  const handleRefresh = () => {
    fetchPendingDeposits();
    toast.success("Deposit data refreshed");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Pending Deposits ({deposits.length})</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <DepositsTable 
          deposits={deposits}
          isLoading={isLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewScreenshot={setViewingScreenshot}
        />
      </div>
      
      <Dialog open={!!viewingScreenshot} onOpenChange={() => setViewingScreenshot(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Deposit Screenshot</DialogTitle>
          </DialogHeader>
          {viewingScreenshot && (
            <img 
              src={viewingScreenshot} 
              alt="Deposit Screenshot" 
              className="w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
