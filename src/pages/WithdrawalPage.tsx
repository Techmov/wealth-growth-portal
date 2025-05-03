
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WithdrawalForm } from "@/components/WithdrawalForm";
import { WithdrawalsRequestList } from "@/components/WithdrawalsRequestList";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { WithdrawalRequest } from "@/types";
import { useState, useEffect } from "react";

const WithdrawalPage = () => {
  const { user, isLoading } = useAuth();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    // In a real app, you would fetch withdrawal requests from your backend
    if (user) {
      // Check if the user has any withdrawal requests stored
      const userWithdrawals = localStorage.getItem(`withdrawals_${user.id}`);
      if (userWithdrawals) {
        setWithdrawalRequests(JSON.parse(userWithdrawals));
      } else {
        // New users should have no withdrawal history
        setWithdrawalRequests([]);
        localStorage.setItem(`withdrawals_${user.id}`, JSON.stringify([]));
      }
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Withdraw Funds</h1>
            <p className="text-muted-foreground mt-2">
              Request a withdrawal to your TRC20 wallet
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <WithdrawalForm />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Withdrawal History</h2>
            <WithdrawalsRequestList withdrawalRequests={withdrawalRequests} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WithdrawalPage;
