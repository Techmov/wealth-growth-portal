
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalRequest } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsivePagination } from "@/components/ResponsivePagination";
import { Check, X } from "lucide-react";

export function WithdrawalApprovals() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    fetchWithdrawalRequests();
    
    // Setup realtime subscription for withdrawal requests
    const channel = supabase
      .channel("withdrawal-requests-changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "withdrawal_requests" }, 
        () => fetchWithdrawalRequests()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTab, currentPage]);
  
  const fetchWithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("withdrawal_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", currentTab);
        
      if (countError) throw countError;
      
      // Calculate total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
      
      // Get paginated data
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select(`
          *,
          profiles:user_id (name, email, username)
        `)
        .eq("status", currentTab)
        .order("date", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      
      if (data) {
        const formattedRequests: WithdrawalRequest[] = data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          amount: item.amount,
          status: item.status as "pending" | "approved" | "rejected",
          date: new Date(item.date || Date.now()),
          trc20Address: item.trc20_address || "",
          txHash: item.tx_hash || undefined,
          rejectionReason: item.rejection_reason || undefined,
          // Adding profile data
          userName: item.profiles?.name || "Unknown",
          userEmail: item.profiles?.email || "",
          username: item.profiles?.username || ""
        }));
        
        setWithdrawalRequests(formattedRequests);
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast.error("Failed to load withdrawal requests");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async (withdrawal: WithdrawalRequest) => {
    try {
      // Get user data first to update their values
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('total_withdrawn')
        .eq('id', withdrawal.userId)
        .single();
      
      if (userError) throw userError;
      
      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from("withdrawal_requests")
        .update({ 
          status: "approved",
          txHash: "TX" + Math.random().toString(36).substr(2, 9).toUpperCase()
        })
        .eq("id", withdrawal.id);
      
      if (updateError) throw updateError;
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: withdrawal.userId,
          type: "withdrawal",
          amount: withdrawal.amount,
          status: "completed",
          trc20_address: withdrawal.trc20Address,
          description: "Withdrawal request approved"
        });
        
      if (transactionError) throw transactionError;
      
      // Update user total_withdrawn amount using the user data we fetched
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_withdrawn: withdrawal.amount + (userData?.total_withdrawn || 0),
        })
        .eq('id', withdrawal.userId);
        
      if (profileError) throw profileError;
      
      toast.success("Withdrawal request approved successfully");
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast.error("Failed to approve withdrawal");
    }
  };
  
  const handleReject = async (withdrawal: WithdrawalRequest, rejectionReason: string = "Request rejected by admin") => {
    try {
      // Get user data first to update their values
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', withdrawal.userId)
        .single();
      
      if (userError) throw userError;
      
      // Update withdrawal request status
      const { error: updateError } = await supabase
        .from("withdrawal_requests")
        .update({ 
          status: "rejected",
          rejection_reason: rejectionReason
        })
        .eq("id", withdrawal.id);
      
      if (updateError) throw updateError;
      
      // Create a transaction record for refund
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: withdrawal.userId,
          type: "withdrawal",
          amount: withdrawal.amount,
          status: "rejected",
          description: "Withdrawal request rejected: " + rejectionReason
        });
      
      if (transactionError) throw transactionError;
      
      // Refund the amount to user's balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: withdrawal.amount + (userData?.balance || 0),
        })
        .eq('id', withdrawal.userId);
        
      if (profileError) throw profileError;
      
      toast.success("Withdrawal request rejected and amount refunded");
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error("Failed to reject withdrawal");
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending withdrawal requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TRC20 Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{withdrawal.userName || withdrawal.username || withdrawal.userEmail}</div>
                        <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${withdrawal.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{withdrawal.trc20Address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{withdrawal.date.toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleApprove(withdrawal)}>
                          <Check className="h-4 w-4 mr-2" />Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleReject(withdrawal)}>
                          <X className="h-4 w-4 mr-2" />Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="approved">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No approved withdrawal requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TRC20 Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{withdrawal.userName || withdrawal.username || withdrawal.userEmail}</div>
                        <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${withdrawal.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{withdrawal.trc20Address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{withdrawal.date.toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{withdrawal.txHash}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="rejected">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No rejected withdrawal requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TRC20 Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rejection Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.map((withdrawal) => (
                    <tr key={withdrawal.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{withdrawal.userName || withdrawal.username || withdrawal.userEmail}</div>
                        <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${withdrawal.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{withdrawal.trc20Address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{withdrawal.date.toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{withdrawal.rejectionReason}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {withdrawalRequests.length > 0 && (
        <ResponsivePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
