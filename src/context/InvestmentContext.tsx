import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { Investment, Product, Transaction, WithdrawalRequest, Downline } from "@/types";
import { supabase } from "@/integrations/supabase/client";

type InvestmentContextType = {
  products: Product[];
  userInvestments: Investment[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  platformTrc20Address: string;
  isLoading: boolean; // Add isLoading property
  invest: (productId: string) => Promise<void>;
  getReferralBonus: (referralCode: string) => Promise<void>;
  getUserDownlines: () => Downline[];
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

// Platform TRC20 address - this would typically come from an environment variable or database
const platformTrc20Address = "TRX3DcAfsJPKdHnNdXeZXCqnDmHqNnUUhH";

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialize isLoading state

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true); // Set loading state
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
            risk: prod.risk as 'low' | 'medium' | 'high'
          }));
          
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Unexpected error fetching products:", error);
      } finally {
        setIsLoading(false); // Clear loading state
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

  // Fetch user investments, transactions, and withdrawal requests from Supabase
  useEffect(() => {
    if (!user) {
      setUserInvestments([]);
      setTransactions([]);
      setWithdrawalRequests([]);
      setIsLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true); // Set loading state
      try {
        // Fetch user's investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id);

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
        } else if (investmentsData) {
          // Map Supabase data to our Investment type
          const mappedInvestments: Investment[] = investmentsData.map(inv => ({
            id: inv.id,
            userId: inv.user_id,
            productId: inv.product_id,
            amount: inv.amount,
            startDate: new Date(inv.start_date),
            endDate: new Date(inv.end_date),
            startingValue: inv.starting_value,
            currentValue: inv.current_value,
            finalValue: inv.final_value,
            status: inv.status as 'active' | 'completed' | 'cancelled'
          }));
          
          setUserInvestments(mappedInvestments);
        }

        // Fetch user's transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
        } else if (transactionsData) {
          // Map Supabase data to our Transaction type
          const mappedTransactions: Transaction[] = transactionsData.map(tx => ({
            id: tx.id,
            userId: tx.user_id,
            type: tx.type as 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral',
            amount: tx.amount,
            status: tx.status as 'pending' | 'completed' | 'failed' | 'rejected',
            date: new Date(tx.date || Date.now()),
            description: tx.description,
            trc20Address: tx.trc20_address,
            txHash: tx.tx_hash,
            depositScreenshot: tx.deposit_screenshot,
            rejectionReason: tx.rejection_reason
          }));
          
          setTransactions(mappedTransactions);
        }

        // Fetch user's withdrawal requests
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (withdrawalError) {
          console.error("Error fetching withdrawal requests:", withdrawalError);
        } else if (withdrawalData) {
          // Map Supabase data to our WithdrawalRequest type
          const mappedWithdrawals: WithdrawalRequest[] = withdrawalData.map(wr => ({
            id: wr.id,
            userId: wr.user_id,
            amount: wr.amount,
            status: wr.status as 'pending' | 'approved' | 'rejected',
            date: new Date(wr.date || Date.now()),
            trc20Address: wr.trc20_address,
            txHash: wr.tx_hash,
            rejectionReason: wr.rejection_reason
          }));
          
          setWithdrawalRequests(mappedWithdrawals);
        }
      } catch (error) {
        console.error("Unexpected error fetching user data:", error);
      } finally {
        setIsLoading(false); // Clear loading state
      }
    };

    fetchUserData();

    // Set up real-time subscription to user's data
    const userInvestmentsChannel = supabase
      .channel('user-investments')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
    
    const userTransactionsChannel = supabase
      .channel('user-transactions')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
      
    const withdrawalRequestsChannel = supabase
      .channel('withdrawal-requests')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(userInvestmentsChannel);
      supabase.removeChannel(userTransactionsChannel);
      supabase.removeChannel(withdrawalRequestsChannel);
    };
  }, [user]);

  // Invest in a product
  const invest = async (productId: string) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      // Find the product
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Fixed investment amount from the product
      const amount = product.amount;

      // Check if user has enough balance
      if (amount > user.balance) {
        throw new Error("Insufficient balance");
      }

      // Calculate investment details
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);
      const finalValue = amount * 2; // Double the investment amount

      // Using direct table insertion instead of RPC - this avoids the TS2345 error
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          product_id: productId,
          amount: amount,
          end_date: endDate.toISOString(),
          starting_value: amount,
          current_value: amount,
          final_value: finalValue,
          status: 'active'
        })
        .select('id')
        .single();

      if (investmentError) {
        console.error("Investment error:", investmentError);
        throw new Error(investmentError.message || "Investment failed");
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'investment',
          amount: -amount, // Negative as money is leaving balance
          status: 'completed',
          description: `Investment in ${product.name}`
        });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        // Continue even if transaction record fails
      }

      // Update user balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: user.balance - amount,
          total_invested: user.totalInvested + amount
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Continue even if profile update fails
      }

      toast.success(`Successfully invested $${amount} in ${product.name}`);

      // Refresh user data to reflect the new balance and investments
      // This is handled by the realtime subscription

    } catch (error: any) {
      toast.error(error.message || "Investment failed");
      throw error;
    }
  };

  // Handle referral bonuses
  const getReferralBonus = async (referralCode: string) => {
    if (!user) {
      toast.error("You must be logged in to claim referral bonus");
      return;
    }

    try {
      // In a real app, we'd verify this code against the database
      if (referralCode && referralCode !== user.referralCode) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This function now just notifies user that bonuses are automatically added
        toast.info("Referral bonuses are automatically added to your account when a referred user makes a deposit.");
      } else {
        toast.error("Invalid referral code");
      }
    } catch (error) {
      toast.error("Failed to process referral code");
    }
  };

  // Get user's downlines (referred users)
  const getUserDownlines = () => {
    if (!user) return [];

    // This would need to be implemented with actual data from Supabase
    // For now, we'll return an empty array as a placeholder
    return [];
  };

  return (
    <InvestmentContext.Provider value={{ 
      products, 
      userInvestments, 
      transactions, 
      withdrawalRequests,
      platformTrc20Address,
      isLoading, // Include isLoading in the context value
      invest, 
      getReferralBonus,
      getUserDownlines
    }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error("useInvestment must be used within an InvestmentProvider");
  }
  return context;
}
