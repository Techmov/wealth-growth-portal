
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { InvestmentCard } from "@/components/InvestmentCard";

const InvestmentsPage = () => {
  const { user } = useAuth();
  const { products } = useInvestment();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Investment Products</h1>
          <p className="text-muted-foreground">
            Choose an investment product that matches your goals
          </p>
        </div>

        <div className="mb-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Your Investment Profile</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Available Balance:</span>
              <span className="ml-2 font-bold">${user.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total Invested:</span>
              <span className="ml-2 font-bold">${user.totalInvested.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            All products are designed to double your investment over their duration. Higher risk products have a shorter timeframe but may be more volatile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <InvestmentCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InvestmentsPage;
