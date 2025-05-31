
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Investment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useInvestmentActions } from '@/hooks/useInvestmentActions';

interface InvestmentContextType {
  products: Product[];
  userInvestments: Investment[];
  transactions: any[]; // Added missing property
  withdrawalRequests: any[]; // Added missing property
  platformTrc20Address: string; // Added missing property
  isLoading: boolean;
  invest: (investmentData: any) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Removed fetchProfile since it doesn't exist
  const { invest: investAction } = useInvestmentActions(user);

  // Platform TRC20 address - this should be configurable
  const platformTrc20Address = "TQk4fXaSRJt32y5od9TeQFh6z3zaeyiQcu"; // You should make this configurable

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        amount: product.amount,
        duration: product.duration,
        growthRate: product.growth_rate,
        risk: product.risk as 'low' | 'medium' | 'high',
        active: product.active,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchUserInvestments = async () => {
    if (!user) {
      setUserInvestments([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Don't transform the data, use it as-is since types now match database
      setUserInvestments(data || []);
    } catch (error) {
      console.error('Error fetching user investments:', error);
      setUserInvestments([]);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchUserInvestments()]);
    setIsLoading(false);
  };

  const invest = async (investmentData: any) => {
    await investAction(investmentData);
    await refreshData();
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const investmentsChannel = user ? supabase
      .channel('investments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${user.id}` }, 
        () => {
          fetchUserInvestments();
        }
      )
      .subscribe() : null;

    return () => {
      supabase.removeChannel(productsChannel);
      if (investmentsChannel) supabase.removeChannel(investmentsChannel);
    };
  }, [user?.id]);

  return (
    <InvestmentContext.Provider 
      value={{ 
        products, 
        userInvestments,
        transactions,
        withdrawalRequests,
        platformTrc20Address,
        isLoading, 
        invest, 
        refreshData 
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
}
