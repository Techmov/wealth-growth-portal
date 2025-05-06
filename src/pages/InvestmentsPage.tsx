
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { useAuth } from "@/context/AuthContext";
import { InvestmentCard } from "@/components/InvestmentCard";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { TrendingUp } from "lucide-react";

const InvestmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('amount', { ascending: true });

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        // Format products
        const formattedProducts: Product[] = data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          amount: product.amount,
          duration: product.duration,
          growthRate: product.growth_rate,
          risk: product.risk as 'low' | 'medium' | 'high'
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Unexpected error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription for product updates
    const channel = supabase
      .channel('investments-products')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  if (!user) return null;

  return (
    <UserLayout>
      <div className="container py-8">
        <Heading
          title="Investment Products"
          description="Choose an investment product that matches your goals"
          icon={<TrendingUp className="h-6 w-6" />}
        />

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
            All products are designed to double your investment over their duration. Fixed investment amounts with varying risk levels.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <InvestmentCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default InvestmentsPage;
