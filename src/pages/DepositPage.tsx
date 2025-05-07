
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { DepositForm } from "@/components/DepositForm";
import { useAuth } from "@/context/AuthContext";
import { ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types";
import { TransactionsList } from "@/components/TransactionsList";
import { ResponsivePagination } from "@/components/ResponsivePagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DepositPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch deposit transactions
  useEffect(() => {
    if (user) {
      const fetchDeposits = async () => {
        try {
          setIsLoadingDeposits(true);
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'deposit')
            .order('date', { ascending: false });

          if (error) {
            console.error("Error fetching deposits:", error);
            return;
          }

          // Format the deposits with proper type casting for the transaction type and status
          const formattedDeposits: Transaction[] = data.map(tx => ({
            id: tx.id,
            userId: tx.user_id,
            amount: tx.amount,
            type: tx.type as "deposit" | "withdrawal" | "investment" | "return" | "referral" | "profit",
            status: tx.status as "pending" | "completed" | "failed" | "rejected",
            date: new Date(tx.date || Date.now()),
            description: tx.description || undefined,
            txHash: tx.tx_hash || undefined
          }));

          setDeposits(formattedDeposits);
        } catch (error) {
          console.error("Unexpected error fetching deposits:", error);
        } finally {
          setIsLoadingDeposits(false);
        }
      };

      fetchDeposits();
      
      // Set up real-time subscription for updates
      const channel = supabase
        .channel('deposit-changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id} AND type=eq.deposit`
          },
          () => {
            fetchDeposits();
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
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate current items for pagination
  const indexOfLastDeposit = currentPage * itemsPerPage;
  const indexOfFirstDeposit = indexOfLastDeposit - itemsPerPage;
  const currentDeposits = deposits.slice(indexOfFirstDeposit, indexOfLastDeposit);
  const totalPages = Math.ceil(deposits.length / itemsPerPage);

  return (
    <UserLayout>
      <div className="container py-8 max-w-4xl px-4 sm:px-6">
        <Heading
          title="Deposit Funds"
          description="Deposit USDT (TRC20) to your account"
          icon={<ArrowUp className="h-6 w-6" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <DepositForm />
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Deposit Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Balance:</span>
                <span className="font-bold">${user.balance.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Invested:</span>
                <span>${user.totalInvested.toFixed(2)}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Deposits:</span>
                <span>${deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Total Deposits:</span>
                <span className="font-bold">${deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Deposit History</CardTitle>
              <CardDescription>Your previous deposit requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDeposits ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TransactionsList transactions={currentDeposits} />
                  
                  {deposits.length > itemsPerPage && (
                    <div className="mt-6">
                      <ResponsivePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                  
                  {deposits.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 border rounded-lg">
                      <p className="text-muted-foreground">You haven't made any deposit requests yet.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default DepositPage;
