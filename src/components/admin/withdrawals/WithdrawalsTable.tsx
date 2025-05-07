
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

interface WithdrawalsTableProps {
  withdrawals: WithdrawalRequest[];
  onApprove: (withdrawal: WithdrawalRequest) => void;
  onReject: (withdrawalId: string) => void;
}

export function WithdrawalsTable({
  withdrawals,
  onApprove,
  onReject
}: WithdrawalsTableProps) {
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
        {withdrawals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No pending withdrawals found
            </TableCell>
          </TableRow>
        ) : (
          withdrawals.map((withdrawal) => (
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
          ))
        )}
      </TableBody>
    </Table>
  );
}
