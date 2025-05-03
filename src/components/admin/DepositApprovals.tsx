
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
    // For now, check localStorage first or use mock data
    const storedDeposits = localStorage.getItem("pendingDeposits");
    if (storedDeposits) {
      setDeposits(JSON.parse(storedDeposits));
    } else {
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
      localStorage.setItem("pendingDeposits", JSON.stringify(mockDeposits));
    }
  }, []);

  const handleApprove = (depositId: string) => {
    // Find the deposit to approve
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return;

    // Update the deposit status
    const updatedDeposits: Transaction[] = deposits.map(d => 
      d.id === depositId ? { ...d, status: "completed" as const } : d
    );
    
    setDeposits(updatedDeposits);
    localStorage.setItem("pendingDeposits", JSON.stringify(updatedDeposits));
    
    // Update admin stats
    const currentStats = JSON.parse(localStorage.getItem("adminStats") || "{}");
    const newStats = {
      ...currentStats,
      totalDeposits: (currentStats.totalDeposits || 0) + deposit.amount,
      pendingDeposits: Math.max(0, (currentStats.pendingDeposits || 0) - 1)
    };
    localStorage.setItem("adminStats", JSON.stringify(newStats));
    
    // Update user balance if they exist
    const users = JSON.parse(localStorage.getItem("adminUsers") || "[]");
    const updatedUsers = users.map(user => {
      if (user.id === deposit.userId) {
        return {
          ...user,
          balance: (user.balance || 0) + deposit.amount
        };
      }
      return user;
    });
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
    
    // Dispatch event for stats update
    window.dispatchEvent(new CustomEvent("depositStatusChange"));
    
    toast({
      title: "Deposit Approved",
      description: `Deposit #${depositId} has been approved.`,
    });
  };

  const handleReject = (depositId: string) => {
    // Find the deposit to reject
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return;

    // Update the deposit status
    const updatedDeposits: Transaction[] = deposits.map(d => 
      d.id === depositId ? { ...d, status: "failed" as const } : d
    );
    
    setDeposits(updatedDeposits);
    localStorage.setItem("pendingDeposits", JSON.stringify(updatedDeposits));
    
    // Update admin stats
    const currentStats = JSON.parse(localStorage.getItem("adminStats") || "{}");
    const newStats = {
      ...currentStats,
      pendingDeposits: Math.max(0, (currentStats.pendingDeposits || 0) - 1)
    };
    localStorage.setItem("adminStats", JSON.stringify(newStats));
    
    // Dispatch event for stats update
    window.dispatchEvent(new CustomEvent("depositStatusChange"));
    
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
