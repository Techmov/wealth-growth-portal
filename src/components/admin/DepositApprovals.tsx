import { useState, useEffect } from "react";
import { Transaction } from "@/types";
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
  DialogTitle
} from "@/components/ui/dialog";
import { incrementValue } from "@/utils/supabaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";

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
      .channel('admin-transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log("Transaction change detected:", payload);
          fetchPendingDeposits();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching pending deposits...");
      
      const pendingDeposits = await adminUtils.getPendingDeposits();
      
      if (pendingDeposits) {
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
      }
    } catch (error) {
      console.error("Error fetching pending deposits:", error);
      toast.error("Failed to load pending deposits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      // Find the deposit to approve
      const deposit = deposits.find(d => d.id === depositId);
      if (!deposit) return;

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Deposits ({deposits.length})</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
            <p className="text-sm text-muted-foreground">Loading deposits...</p>
          </div>
        </div>
      ) : deposits.length === 0 ? (
        <div className="border rounded-md flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Check className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>No pending deposits to approve</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TRC20 Address</TableHead>
                <TableHead>TX Hash</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-mono text-xs">{deposit.userId}</TableCell>
                  <TableCell className="font-medium">${deposit.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[160px] truncate">{deposit.trc20Address}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[160px] truncate">{deposit.txHash}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(deposit.date), { addSuffix: true })}</TableCell>
                  <TableCell>
                    {deposit.depositScreenshot && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingScreenshot(deposit.depositScreenshot || null)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprove(deposit.id)}
                        className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(deposit.id)}
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
