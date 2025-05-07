
import { WithdrawalRequest } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Shield, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WithdrawalsRequestListProps {
  withdrawalRequests: WithdrawalRequest[];
}

export function WithdrawalsRequestList({ withdrawalRequests }: WithdrawalsRequestListProps) {
  // Function to determine icon and color based on withdrawal request status
  const getStatusStyles = (status: WithdrawalRequest["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          bgClass: "bg-yellow-100",
          textClass: "text-yellow-700",
          borderClass: "border-yellow-200",
          title: "Pending"
        };
      case "approved":
        return {
          icon: CheckCircle,
          bgClass: "bg-green-100",
          textClass: "text-green-700",
          borderClass: "border-green-200",
          title: "Approved"
        };
      case "rejected":
        return {
          icon: XCircle,
          bgClass: "bg-red-100",
          textClass: "text-red-700",
          borderClass: "border-red-200",
          title: "Rejected"
        };
      default:
        return {
          icon: AlertCircle,
          bgClass: "bg-gray-100",
          textClass: "text-gray-700",
          borderClass: "border-gray-200",
          title: "Unknown"
        };
    }
  };

  // Format withdrawal source for display
  const formatSource = (source?: string) => {
    if (!source) return "Profit";
    return source === "profit" ? "Profit" : "Referral Bonus";
  };

  const getSourceBadgeClass = (source?: string) => {
    return source === "referral_bonus" ? 
      "bg-green-100 text-green-800 hover:bg-green-100" : 
      "bg-blue-100 text-blue-800 hover:bg-blue-100";
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
      {withdrawalRequests.map((request) => {
        const { icon: StatusIcon, bgClass, textClass, borderClass, title } = getStatusStyles(request.status);
        const sourceBadgeClass = getSourceBadgeClass(request.withdrawalSource);
        const formattedDate = formatDistanceToNow(new Date(request.date), { addSuffix: true });
        
        return (
          <div 
            key={request.id} 
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border",
              request.status === "pending" && "border-yellow-200 bg-yellow-50/30",
              request.status === "approved" && "border-green-200 bg-green-50/30",
              request.status === "rejected" && "border-red-200 bg-red-50/30"
            )}
          >
            <div className="flex items-center sm:space-x-4 space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass}`}>
                <StatusIcon className={`h-5 w-5 ${textClass}`} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">Withdrawal Request</p>
                  <Badge variant="outline" className={sourceBadgeClass}>
                    {formatSource(request.withdrawalSource)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {formattedDate}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  {request.status === "pending" ? (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                      <span className="text-xs text-yellow-600">Processing within 24 hours</span>
                    </div>
                  ) : request.status === "approved" ? (
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">Payment sent to your wallet</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-xs text-red-600">
                        {request.rejectionReason || "Request rejected"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="font-semibold text-red-600">
                -{request.amount.toFixed(2)} USD
              </p>
              <p className={`text-xs font-medium ${textClass}`}>
                {title.toUpperCase()}
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
