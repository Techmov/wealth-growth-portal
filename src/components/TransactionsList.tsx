
import { Transaction } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, CreditCard, Gift, Undo } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  // Function to determine icon and color based on transaction type
  const getTransactionStyles = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return {
          icon: ArrowDownRight,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200"
        };
      case "withdrawal":
        return {
          icon: ArrowUpRight,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200"
        };
      case "investment":
        return {
          icon: CreditCard,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          borderColor: "border-blue-200"
        };
      case "return":
        return {
          icon: Undo,
          bgColor: "bg-purple-100",
          textColor: "text-purple-700",
          borderColor: "border-purple-200"
        };
      case "referral":
        return {
          icon: Gift,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200"
        };
      default:
        return {
          icon: CreditCard,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200"
        };
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const { icon: Icon, bgColor, textColor, borderColor } = getTransactionStyles(transaction.type);
        const isPositive = transaction.type === "deposit" || transaction.type === "return" || transaction.type === "referral";
        const formattedDate = formatDistanceToNow(new Date(transaction.date), { addSuffix: true });
        const badgeStyle = getStatusBadgeStyle(transaction.status);
        
        return (
          <div key={transaction.id} className={cn(
            "flex items-center justify-between p-4 rounded-lg border",
            transaction.status === "pending" && "border-yellow-200 bg-yellow-50/30",
            transaction.status === "completed" && "border-green-100",
            (transaction.status === "failed" || transaction.status === "rejected") && "border-red-100 bg-red-50/30"
          )}>
            <div className="flex items-center sm:space-x-4 space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                <Icon className={`h-5 w-5 ${textColor}`} />
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  <span className="hidden sm:inline"> {transaction.description ? `- ${transaction.description}` : ""}</span>
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-muted-foreground">
                  <span>{formattedDate}</span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="outline" className={badgeStyle}>
                    {transaction.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className={cn(
                "font-semibold",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? "+" : "-"}{Math.abs(transaction.amount).toFixed(2)} USD
              </p>
              <div className="sm:hidden mt-1">
                <Badge variant="outline" className={badgeStyle + " text-xs"}>
                  {transaction.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
