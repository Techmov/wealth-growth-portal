
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

  useEffect(() => {
    // In a real app, fetch pending deposits from backend
    // For now, we'll use mock data
    const mockDeposits: Transaction[] = [
      {
        id: "deposit-1",
        userId: "user-1",
        type: "deposit",
        amount: 1000,
        status: "pending",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        trc20Address: "TXyz123...",
        txHash: "0x123456...",
        depositScreenshot: "https://via.placeholder.com/800x600?text=Deposit+Screenshot+1"
      },
      {
        id: "deposit-2",
        userId: "user-2",
        type: "deposit",
        amount: 2500,
        status: "pending",
        date: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        trc20Address: "TAbc456...",
        txHash: "0x789012...",
        depositScreenshot: "https://via.placeholder.com/800x600?text=Deposit+Screenshot+2"
      },
      {
        id: "deposit-3",
        userId: "user-3",
        type: "deposit",
        amount: 500,
        status: "pending",
        date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        trc20Address: "TDef789...",
        txHash: "0x345678...",
        depositScreenshot: "https://via.placeholder.com/800x600?text=Deposit+Screenshot+3"
      }
    ];
    
    setDeposits(mockDeposits);
  }, []);

  const handleApprove = (depositId: string) => {
    // In a real app, call API to approve deposit
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId 
        ? { ...deposit, status: "completed" } 
        : deposit
    ));
    
    toast({
      title: "Deposit Approved",
      description: `Deposit #${depositId} has been approved.`,
    });
  };

  const handleReject = (depositId: string) => {
    // In a real app, call API to reject deposit
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId 
        ? { ...deposit, status: "failed" } 
        : deposit
    ));
    
    toast({
      title: "Deposit Rejected",
      description: `Deposit #${depositId} has been rejected.`,
    });
  };

  const pendingDeposits = deposits.filter(deposit => deposit.status === "pending");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Deposits ({pendingDeposits.length})</h3>
      
      {pendingDeposits.length === 0 ? (
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
              {pendingDeposits.map((deposit) => (
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
