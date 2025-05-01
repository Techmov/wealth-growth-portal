
import { Transaction } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Function to determine icon and color based on transaction type
  const getTransactionStyles = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return {
          iconClass: "bg-green-100 text-green-600",
          icon: "+",
          textClass: "text-green-600"
        };
      case "withdrawal":
        return {
          iconClass: "bg-red-100 text-red-600",
          icon: "-",
          textClass: "text-red-600"
        };
      case "investment":
        return {
          iconClass: "bg-blue-100 text-blue-600",
          icon: "↗",
          textClass: "text-blue-600"
        };
      case "return":
        return {
          iconClass: "bg-purple-100 text-purple-600",
          icon: "↙",
          textClass: "text-purple-600"
        };
      case "referral":
        return {
          iconClass: "bg-yellow-100 text-yellow-600",
          icon: "★",
          textClass: "text-yellow-600"
        };
      default:
        return {
          iconClass: "bg-gray-100 text-gray-600",
          icon: "•",
          textClass: "text-gray-600"
        };
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
      {sortedTransactions.map((transaction) => {
        const { iconClass, icon, textClass } = getTransactionStyles(transaction.type);
        const isPositive = transaction.amount > 0;
        
        return (
          <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass}`}>
                {icon}
              </div>
              <div>
                <p className="font-medium">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{transaction.amount.toFixed(2)} USD
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.status}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
