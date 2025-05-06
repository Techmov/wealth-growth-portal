
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { DepositForm } from "@/components/DepositForm";
import { useAuth } from "@/context/AuthContext";
import { ArrowUp } from "lucide-react";

const DepositPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
          title="Deposit Funds"
          description="Deposit USDT (TRC20) to your account"
          icon={<ArrowUp className="h-6 w-6" />}
        />
        
        <div className="bg-card rounded-lg border p-6 mt-6">
          <DepositForm />
        </div>
      </div>
    </UserLayout>
  );
};

export default DepositPage;
