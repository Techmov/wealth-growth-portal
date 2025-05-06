
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export function DepositApprovals() {
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingDeposits();
    
    // Set up real-time subscription for transactions
    const channel = supabase
      .channel('admin-transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: "type=eq.deposit" },
        () => fetchPendingDeposits()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }

      if (data) {
        const formattedDeposits: Transaction[] = data.map(tx => ({
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
      toast({
        title: "Error",
        description: "Failed to load pending deposits",
        variant: "destructive"
      });
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

      // Update user balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: supabase.rpc('increment', { row_id: deposit.userId, amount: deposit.amount }),
        })
        .eq('id', deposit.userId);

      if (profileError) throw profileError;
      
      // Update local state
      setDeposits(deposits.filter(d => d.id !== depositId));
      
      toast({
        title: "Deposit Approved",
        description: `Deposit has been approved and funds added to user's balance.`,
      });
    } catch (error) {
      console.error("Error approving deposit:", error);
      toast({
        title: "Error",
        description: "Failed to approve deposit",
        variant: "destructive"
      });
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
      
      toast({
        title: "Deposit Rejected",
        description: `Deposit has been rejected.`,
      });
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      toast({
        title: "Error",
        description: "Failed to reject deposit",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Deposits ({deposits.length})</h3>
      
      {isLoading ? (
        <div className="text-center py-8">Loading deposits...</div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No pending deposits to approve
        </div>
      ) : (
        <div className="border rounded-md">
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
                  <TableCell>{deposit.userId}</TableCell>
                  <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">{deposit.trc20Address}</TableCell>
                  <TableCell className="font-mono text-xs">{deposit.txHash}</TableCell>
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
                        className="text-green-500"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(deposit.id)}
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
