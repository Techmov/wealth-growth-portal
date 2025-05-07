
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";

export function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true);

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        if (data) {
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
        () => {
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
