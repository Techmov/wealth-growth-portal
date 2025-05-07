
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { WithdrawalsRequestList } from "@/components/WithdrawalsRequestList";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalRequest } from "@/types";
import { ArrowDown } from "lucide-react";
import { useWithdrawalStats } from "@/hooks/useWithdrawalStats";

const WithdrawalPage = () => {
  const { user, isLoading } = useAuth();
  const { stats } = useWithdrawalStats(user);
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Fetch withdrawal requests from the database
  useEffect(() => {
    if (user) {
      const fetchWithdrawalRequests = async () => {
        try {
          setIsLoadingRequests(true);
          const { data, error } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error("Error fetching withdrawal requests:", error);
            return;
          }

          // Format the withdrawal requests
          const formattedRequests: WithdrawalRequest[] = data.map(req => ({
            id: req.id,
            userId: req.user_id,
            amount: req.amount,
            status: req.status as 'pending' | 'approved' | 'rejected',
            date: new Date(req.date || Date.now()),
            trc20Address: req.trc20_address,
            txHash: req.tx_hash || undefined,
            rejectionReason: req.rejection_reason || undefined,
            withdrawalSource: req.withdrawal_source as 'profit' | 'referral_bonus' || undefined
          }));

          setWithdrawalRequests(formattedRequests);
        } catch (error) {
          console.error("Unexpected error fetching withdrawal requests:", error);
        } finally {
          setIsLoadingRequests(false);
        }
      };

      fetchWithdrawalRequests();
      
      // Set up real-time subscription for updates
      const channel = supabase
        .channel('withdrawal-requests-changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchWithdrawalRequests();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <UserLayout>
      <div className="container py-8 max-w-4xl">
        <Heading
          title="Withdraw Funds"
          description="Request a withdrawal to your TRC20 wallet"
          icon={<ArrowDown className="h-6 w-6" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <WithdrawalForm />
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Withdrawal Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available for Withdrawal:</span>
                <span className="font-bold">${stats.availableWithdrawal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">From Profits:</span>
                <span>${stats.profitAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">From Referrals:</span>
                <span>${stats.referralBonus.toFixed(2)}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Withdrawals:</span>
                <span>${stats.pendingWithdrawals.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Escrowed Amount:</span>
                <span>${stats.escrowedAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Total Withdrawn:</span>
                <span className="font-bold">${user.totalWithdrawn.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Withdrawal History</h2>
          {isLoadingRequests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <WithdrawalsRequestList withdrawalRequests={withdrawalRequests} />
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default WithdrawalPage;
