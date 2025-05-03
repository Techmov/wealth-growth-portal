
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "./AuthContext";
import { Investment, Product, Transaction, WithdrawalRequest } from "@/types";

type InvestmentContextType = {
  products: Product[];
  userInvestments: Investment[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  platformTrc20Address: string;
  invest: (productId: string, amount: number) => Promise<void>;
  getReferralBonus: (referralCode: string) => Promise<void>;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

// Mock products data
const mockProducts: Product[] = [
  {
    id: "prod_1",
    name: "Wealth Starter",
    description: "Low risk investment that doubles over 30 days. Perfect for beginners.",
    minAmount: 100,
    duration: 30,
    growthRate: 3.33, // ~100% over 30 days
    risk: "low"
  },
  {
    id: "prod_2",
    name: "Growth Accelerator",
    description: "Medium risk investment with higher potential returns. Doubles over 20 days.",
    minAmount: 500,
    duration: 20,
    growthRate: 5, // 100% over 20 days
    risk: "medium"
  },
  {
    id: "prod_3",
    name: "Wealth Maximizer",
    description: "Higher risk with maximum returns. Doubles investment in just 15 days.",
    minAmount: 1000,
    duration: 15,
    growthRate: 6.67, // 100% over 15 days
    risk: "high"
  }
];

// Platform TRC20 address
const platformTrc20Address = "TRX3DcAfsJPKdHnNdXeZXCqnDmHqNnUUhH";

// Get persistent storage for data
const getStoredData = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Save data to persistent storage
const saveStoredData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function InvestmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products] = useState<Product[]>(mockProducts);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    if (user) {
      // Load data from localStorage
      const allInvestments = getStoredData("investments", []);
      const allTransactions = getStoredData("transactions", []);
      const allWithdrawalRequests = getStoredData("withdrawalRequests", []);
      
      // Filter investments for current user
      const filteredInvestments = allInvestments.filter(inv => inv.userId === user.id);
      setUserInvestments(filteredInvestments);
      
      // Filter transactions for current user
      const filteredTransactions = allTransactions.filter(tx => tx.userId === user.id);
      setTransactions(filteredTransactions);
      
      // Filter withdrawal requests for current user
      const filteredWithdrawalRequests = allWithdrawalRequests.filter(wr => wr.userId === user.id);
      setWithdrawalRequests(filteredWithdrawalRequests);
    } else {
      setUserInvestments([]);
      setTransactions([]);
      setWithdrawalRequests([]);
    }
  }, [user]);

  // Listen for new deposit transactions
  useEffect(() => {
    const handleNewTransaction = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        const { userId, type, amount, txHash } = event.detail;
        
        // Create transaction
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type,
          amount,
          status: 'completed', // In a real app, this would be 'pending' until approved
          date: new Date(),
          txHash,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} via TRC20`
        };

        // Update stored data
        const allTransactions = getStoredData("transactions", []);
        allTransactions.push(newTransaction);
        saveStoredData("transactions", allTransactions);
        
        // Update state
        setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
        
        // Check if this deposit should trigger a referral bonus
        if (type === 'deposit' && user.referredBy) {
          // Calculate referral bonus (10% of deposit amount)
          const bonusAmount = amount * 0.1;
          
          // Find the referring user
          const allUsers = getStoredData("users", []);
          const referrer = allUsers.find(u => u.referralCode === user.referredBy);
          
          if (referrer) {
            // Create referral bonus transaction for referrer
            const referralTransaction: Transaction = {
              id: `tx_${Date.now() + 1}`,
              userId: referrer.id,
              type: 'referral',
              amount: bonusAmount,
              status: 'completed',
              date: new Date(),
              description: `Referral bonus (10%) from ${user.name}'s deposit`
            };
            
            // Update referrer's balance and referral bonus
            referrer.balance += bonusAmount;
            referrer.referralBonus += bonusAmount;
            
            // Save updated referrer data
            const updatedUsers = allUsers.map(u => 
              u.id === referrer.id ? referrer : u
            );
            saveStoredData("users", updatedUsers);
            
            // Save referral transaction
            allTransactions.push(referralTransaction);
            saveStoredData("transactions", allTransactions);
            
            // Dispatch an event to inform the UI about the referral bonus
            window.dispatchEvent(new CustomEvent('referralBonusAdded', {
              detail: {
                userId: referrer.id,
                amount: bonusAmount
              }
            }));
          }
        }
      }
    };

    window.addEventListener('newTransaction', handleNewTransaction as EventListener);
    
    return () => {
      window.removeEventListener('newTransaction', handleNewTransaction as EventListener);
    };
  }, [user]);

  // Listen for new withdrawal requests
  useEffect(() => {
    const handleNewWithdrawalRequest = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        const { userId, amount, trc20Address } = event.detail;
        
        // Create withdrawal request
        const newWithdrawalRequest: WithdrawalRequest = {
          id: `wr_${Date.now()}`,
          userId,
          amount,
          status: 'pending',
          date: new Date(),
          trc20Address
        };

        // Create transaction for the withdrawal request
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type: 'withdrawal',
          amount: -amount, // Negative as money is leaving balance
          status: 'pending',
          date: new Date(),
          description: `Withdrawal request to ${trc20Address.substring(0, 8)}...`,
          trc20Address
        };

        // Update stored data
        const allWithdrawalRequests = getStoredData("withdrawalRequests", []);
        allWithdrawalRequests.push(newWithdrawalRequest);
        saveStoredData("withdrawalRequests", allWithdrawalRequests);
        
        const allTransactions = getStoredData("transactions", []);
        allTransactions.push(newTransaction);
        saveStoredData("transactions", allTransactions);
        
        // Update state
        setWithdrawalRequests(prevRequests => [...prevRequests, newWithdrawalRequest]);
        setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
        
        // Update pending withdrawals for admin
        const pendingWithdrawals = getStoredData("pendingWithdrawals", []);
        pendingWithdrawals.push(newWithdrawalRequest);
        saveStoredData("pendingWithdrawals", pendingWithdrawals);
        
        // Dispatch event to update admin dashboard
        window.dispatchEvent(new CustomEvent('withdrawalStatusChange'));
      }
    };

    window.addEventListener('newWithdrawalRequest', handleNewWithdrawalRequest as EventListener);
    
    return () => {
      window.removeEventListener('newWithdrawalRequest', handleNewWithdrawalRequest as EventListener);
    };
  }, [user]);

  const invest = async (productId: string, amount: number) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }

      if (amount < product.minAmount) {
        throw new Error(`Minimum investment amount is $${product.minAmount}`);
      }

      if (amount > user.balance) {
        throw new Error("Insufficient balance");
      }

      // Calculate end date and final value
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + product.duration);
      const finalValue = amount * 2; // Double the investment

      // Create investment
      const newInvestment: Investment = {
        id: `inv_${Date.now()}`,
        userId: user.id,
        productId,
        amount,
        startDate,
        endDate,
        startingValue: amount,
        currentValue: amount,
        finalValue,
        status: 'active'
      };

      // Create transaction
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'investment',
        amount: -amount, // Negative as money is leaving balance
        status: 'completed',
        date: new Date(),
        description: `Investment in ${product.name}`
      };

      // Update stored data
      const allInvestments = getStoredData("investments", []);
      allInvestments.push(newInvestment);
      saveStoredData("investments", allInvestments);
      
      const allTransactions = getStoredData("transactions", []);
      allTransactions.push(newTransaction);
      saveStoredData("transactions", allTransactions);
      
      // Update state
      setUserInvestments([...userInvestments, newInvestment]);
      setTransactions([...transactions, newTransaction]);

      // Update user balance 
      const allUsers = getStoredData("users", []);
      const updatedUsers = allUsers.map(u => {
        if (u.id === user.id) {
          return {
            ...u,
            balance: u.balance - amount,
            totalInvested: u.totalInvested + amount
          };
        }
        return u;
      });
      
      saveStoredData("users", updatedUsers);
      
      // Update user in local storage for current session
      const updatedUser = {
        ...user,
        balance: user.balance - amount,
        totalInvested: user.totalInvested + amount
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success(`Successfully invested $${amount} in ${product.name}`);
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('investmentAdded', {
        detail: {
          userId: user.id,
          amount
        }
      }));
      
      // Simulate page reload to reflect updated user data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Investment failed");
    }
  };

  const getReferralBonus = async (referralCode: string) => {
    if (!user) {
      toast.error("You must be logged in to claim referral bonus");
      return;
    }

    try {
      // In a real app, we'd verify this code against a database
      if (referralCode && referralCode !== user.referralCode) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This function now just notifies user that bonuses are automatic
        toast.info("Referral bonuses are now automatically added to your account when a referred user makes a deposit.");
        // Remove the setReferralCode that's causing the error - we don't need it anymore
      } else {
        toast.error("Invalid referral code");
      }
    } catch (error) {
      toast.error("Failed to process referral code");
    }
  };

  return (
    <InvestmentContext.Provider value={{ 
      products, 
      userInvestments, 
      transactions, 
      withdrawalRequests,
      platformTrc20Address,
      invest, 
      getReferralBonus 
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
