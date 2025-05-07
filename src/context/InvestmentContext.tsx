
import { createContext, useContext, ReactNode } from "react";
import { Investment, Product, Transaction, WithdrawalRequest, Downline } from "@/types";
import { useAuth } from "./AuthContext";
import { useProductsData } from "@/hooks/useProductsData";
import { useUserInvestmentData } from "@/hooks/useUserInvestmentData";
import { useInvestmentActions } from "@/hooks/useInvestmentActions";

type InvestmentContextType = {
  products: Product[];
  userInvestments: Investment[];
  investments: Investment[]; // Alias for backward compatibility
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  platformTrc20Address: string;
  isLoading: boolean;
  invest: (productId: string) => Promise<any>;
  claimProfit: (investmentId: string) => Promise<any>;
  getClaimableProfit: (investmentId: string) => Promise<number>;
  getReferralBonus: (referralCode: string) => Promise<void>;
  getUserDownlines: () => Promise<Downline[]>;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

// Platform TRC20 address - this would typically come from an environment variable or database
const platformTrc20Address = "TRX3DcAfsJPKdHnNdXeZXCqnDmHqNnUUhH";

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { products, isLoading: productsLoading } = useProductsData();
  const { 
    userInvestments, 
    transactions, 
    withdrawalRequests, 
    isLoading: userDataLoading 
  } = useUserInvestmentData(user);
  const { 
    invest, 
    claimProfit, 
    getClaimableProfit,
    getReferralBonus, 
    getUserDownlines 
  } = useInvestmentActions(user);

  // Combine loading states
  const isLoading = productsLoading || userDataLoading;

  return (
    <InvestmentContext.Provider value={{ 
      products, 
      userInvestments, 
      investments: userInvestments, // Alias for backward compatibility
      transactions, 
      withdrawalRequests,
      platformTrc20Address,
      isLoading,
      invest, 
      claimProfit,
      getClaimableProfit,
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
