
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { toast } from "sonner";

export function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching products data...");
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load investment plans");
          return;
        }

        if (data) {
          console.log(`Fetched ${data.length} products`);
          // Map Supabase data to our Product type
          const mappedProducts: Product[] = data.map(prod => ({
            id: prod.id,
            name: prod.name,
            description: prod.description,
            amount: prod.amount,
            duration: prod.duration,
            growthRate: prod.growth_rate,
            risk: prod.risk as 'low' | 'medium' | 'high',
            active: prod.active
          }));
          
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Unexpected error fetching products:", error);
        toast.error("Failed to load investment plans");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription to products table
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log("Product change detected:", payload);
          fetchProducts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, []);

  return { products, isLoading };
}
