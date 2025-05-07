
import { WithdrawalRequest } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WithdrawalsRequestListProps {
  withdrawalRequests: WithdrawalRequest[];
}

export function WithdrawalsRequestList({ withdrawalRequests }: WithdrawalsRequestListProps) {
  // Sort withdrawal requests by date descending
  const sortedRequests = [...withdrawalRequests].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Function to determine icon and color based on withdrawal request status
  const getStatusStyles = (status: WithdrawalRequest["status"]) => {
    switch (status) {
      case "pending":
        return {
          iconClass: "bg-yellow-100 text-yellow-600",
          icon: "⏳",
          textClass: "text-yellow-600"
        };
      case "approved":
        return {
          iconClass: "bg-green-100 text-green-600",
          icon: "✓",
          textClass: "text-green-600"
        };
      case "rejected":
        return {
          iconClass: "bg-red-100 text-red-600",
          icon: "✗",
          textClass: "text-red-600"
        };
      default:
        return {
          iconClass: "bg-gray-100 text-gray-600",
          icon: "•",
          textClass: "text-gray-600"
        };
    }
  };

  // Format withdrawal source for display
  const formatSource = (source?: string) => {
    if (!source) return "Profit";
    return source === "profit" ? "Profit" : "Referral Bonus";
  };

  if (withdrawalRequests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No withdrawal requests yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRequests.map((request) => {
        const { iconClass, icon, textClass } = getStatusStyles(request.status);
        
        return (
          <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass}`}>
                {icon}
              </div>
              <div>
                <p className="font-medium">
                  Withdrawal Request
                  <Badge variant="outline" className="ml-2">
                    {formatSource(request.withdrawalSource)}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(request.date), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {request.status === "pending" ? (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-primary/70 mr-1" />
                      <span className="text-xs text-primary/70">Processing within 24 hours</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 text-primary/70 mr-1" />
                      <span className="text-xs text-primary/70">Protected by withdrawal password</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="font-semibold text-red-600">
                -{request.amount.toFixed(2)} USD
              </p>
              <p className={`text-xs ${textClass} font-medium`}>
                {request.status.toUpperCase()}
              </p>
              {request.txHash && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  TX: {request.txHash.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
