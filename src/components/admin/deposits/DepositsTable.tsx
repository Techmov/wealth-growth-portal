
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
import { AdminLoader } from "../shared/AdminLoader";
import { EmptyState } from "../shared/EmptyState";

interface DepositsTableProps {
  deposits: Transaction[];
  isLoading: boolean;
  onApprove: (depositId: string) => void;
  onReject: (depositId: string) => void;
  onViewScreenshot: (url: string | null) => void;
}

export function DepositsTable({
  deposits,
  isLoading,
  onApprove,
  onReject,
  onViewScreenshot
}: DepositsTableProps) {
  if (isLoading) {
    return <AdminLoader message="Loading deposits..." />;
  }

  if (deposits.length === 0) {
    return (
      <EmptyState
        icon={<Check className="h-6 w-6 text-muted-foreground" />}
        message="No pending deposits to approve"
      />
    );
  }

  return (
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
                  onClick={() => onViewScreenshot(deposit.depositScreenshot)}
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
                  onClick={() => onApprove(deposit.id)}
                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReject(deposit.id)}
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
  );
}
