
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DepositForm } from "@/components/DepositForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const DepositPage = () => {
  const { user, isLoading } = useAuth();

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground mt-2">
              Deposit USDT (TRC20) to your account
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <DepositForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DepositPage;
