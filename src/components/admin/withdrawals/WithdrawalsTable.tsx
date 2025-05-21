
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
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";

interface WithdrawalsTableProps {
  withdrawals: WithdrawalRequest[];
  onApprove: (withdrawal: WithdrawalRequest) => void;
  onReject: (withdrawalId: string) => void;
}

const WITHDRAWAL_FEE = 0; // $3 withdrawal fee

export function WithdrawalsTable({
  withdrawals,
  onApprove,
  onReject
}: WithdrawalsTableProps) {
  // Format withdrawal source for display
  const formatSource = (source?: string) => {
    if (!source) return "Profit";
    return source === "profit" ? "Profit" : "Referral Bonus";
  };

  const getSourceColor = (source?: string) => {
    if (!source || source === "profit") return "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100";
    return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>TRC20 Address</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4">
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
              <TableCell className="text-muted-foreground">${withdrawal.feeAmount?.toFixed(2) || WITHDRAWAL_FEE.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getSourceColor(withdrawal.withdrawalSource)}`}>
                  {formatSource(withdrawal.withdrawalSource)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs max-w-[120px] truncate">
                {withdrawal.trc20Address}
              </TableCell>
              <TableCell>{formatDistanceToNow(new Date(withdrawal.date), { addSuffix: true })}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onApprove(withdrawal)}
                    className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReject(withdrawal.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
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
