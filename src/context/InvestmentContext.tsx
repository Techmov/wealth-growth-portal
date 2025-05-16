import { createContext, useContext, ReactNode } from "react";
import {
  Investment,
  Product,
  Transaction,
  WithdrawalRequest,
  Downline,
} from "@/types";
import { useAuth } from "./AuthContext";
import { useProductsData } from "@/hooks/useProductsData";
import { useUserInvestmentData } from "@/hooks/useUserInvestmentData";
import { useInvestmentActions } from "@/hooks/useInvestmentActions";
import { supabase } from "@/integrations/supabase/client";

const platformTrc20Address = "TQk4fXaSRJt32y5od9TeQFh6z3zaeyiQcu";

type InvestmentContextType = {
  products: Product[];
  userInvestments: Investment[];
  investments: Investment[]; // alias
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  platformTrc20Address: string;
  isLoading: boolean;
  invest: (investmentData: {
    userId: string;
    productId: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
    currentValue: number;
  }) => Promise<void>;
  claimProfit: (investmentId: string) => Promise<any>;
  getClaimableProfit: (investmentId: string) => Promise<number>;
  getReferralBonus: (referralCode: string) => Promise<void>;
  getUserDownlines: () => Promise<Downline[]>;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const { products, isLoading: productsLoading } = useProductsData();

  const {
    userInvestments = [],
    transactions = [],
    withdrawalRequests = [],
    isLoading: userDataLoading,
  } = useUserInvestmentData(); // ✅ no user passed here

  const {
    claimProfit,
    getClaimableProfit,
    getReferralBonus,
    getUserDownlines,
  } = useInvestmentActions(user);

  const isLoading = productsLoading || userDataLoading;

  const invest = async (investmentData: {
    userId: string;
    productId: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
    currentValue: number;
  }) => {
    if (!user) throw new Error("User not authenticated");

    const { error: insertError } = await supabase.from("investments").insert([
      {
        user_id: investmentData.userId,
        product_id: investmentData.productId,
        amount: investmentData.amount,
        start_date: investmentData.startDate,
        end_date: investmentData.endDate,
        status: investmentData.status,
        current_value: investmentData.currentValue,
      },
    ]);

    if (insertError) throw insertError;

    const newBalance = (user.balance || 0) - investmentData.amount;
    const newTotalInvested = (user.totalInvested || 0) + investmentData.amount;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        totalInvested: newTotalInvested,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    setUser({ ...user, balance: newBalance, totalInvested: newTotalInvested });
  };

  return (
    <InvestmentContext.Provider
      value={{
        products: products || [],
        userInvestments: userInvestments || [],
        investments: userInvestments || [],
        transactions: transactions || [],
        withdrawalRequests: withdrawalRequests || [],
        platformTrc20Address,
        isLoading,
        invest,
        claimProfit,
        getClaimableProfit,
        getReferralBonus,
        getUserDownlines,
      }}
    >
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
