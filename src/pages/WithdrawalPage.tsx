
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

const WithdrawalPage = () => {
  const { user, isLoading } = useAuth();
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
            rejectionReason: req.rejection_reason || undefined
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
        
        <div className="bg-card rounded-lg border p-6 mt-6">
          <WithdrawalForm />
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
