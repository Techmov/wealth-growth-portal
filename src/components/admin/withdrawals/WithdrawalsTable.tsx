
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
import { Check, X } from "lucide-react";
import { AdminLoader } from "../shared/AdminLoader";
import { EmptyState } from "../shared/EmptyState";

interface WithdrawalsTableProps {
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  onApprove: (withdrawal: WithdrawalRequest) => void;
  onReject: (withdrawalId: string) => void;
}

export function WithdrawalsTable({
  withdrawals,
  isLoading,
  onApprove,
  onReject
}: WithdrawalsTableProps) {
  if (isLoading) {
    return <AdminLoader message="Loading withdrawals..." />;
  }

  if (withdrawals.length === 0) {
    return (
      <EmptyState
        icon={<Check className="h-6 w-6 text-muted-foreground" />}
        message="No pending withdrawals to approve"
      />
    );
  }

  return (
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
                  onClick={() => onApprove(withdrawal)}
                  className="text-green-500 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReject(withdrawal.id)}
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
