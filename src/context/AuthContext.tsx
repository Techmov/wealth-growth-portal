
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";

// Temporary mock data - in a real app this would be handled by backend
import { User, WithdrawalRequest } from "@/types";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  deposit: (amount: number, txHash: string) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  updateTrc20Address: (address: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data - in a real app this would be in a database
const mockUsers: User[] = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    balance: 1000,
    totalInvested: 2500,
    totalWithdrawn: 500,
    referralBonus: 120,
    referralCode: "DEMO123",
    trc20Address: "TYDzsYUEaYrRXTyX4MnKCr1p4UtR9RJD9E",
    createdAt: new Date("2023-01-01")
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem("wealthUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, just check if user exists in our mock data
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      setUser(foundUser);
      localStorage.setItem("wealthUser", JSON.stringify(foundUser));
      toast.success("Login successful");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("Email already in use");
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        balance: 0,
        totalInvested: 0,
        totalWithdrawn: 0,
        referralBonus: 0,
        referralCode: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        referredBy: referralCode,
        createdAt: new Date()
      };
      
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem("wealthUser", JSON.stringify(newUser));
      toast.success("Account created successfully");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wealthUser");
    toast.info("Logged out successfully");
  };

  const deposit = async (amount: number, txHash: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        // In a real app, this would be handled by backend validation
        // Here we're just simulating a pending deposit that would be approved by an admin later
        
        // In this demo, we'll auto-approve deposits for simplicity
        const updatedUser = {
          ...user,
          balance: user.balance + amount
        };
        setUser(updatedUser);
        localStorage.setItem("wealthUser", JSON.stringify(updatedUser));
        
        // Add transaction to InvestmentContext
        // This would normally be handled by backend
        const depositEvent = new CustomEvent('newTransaction', { 
          detail: { 
            userId: user.id, 
            type: 'deposit', 
            amount: amount, 
            txHash: txHash 
          } 
        });
        window.dispatchEvent(depositEvent);
        
        toast.success(`Successfully deposited $${amount}`);
      }
    } catch (error) {
      toast.error("Deposit failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestWithdrawal = async (amount: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        if (amount > user.balance) {
          throw new Error("Insufficient balance");
        }
        
        if (!user.trc20Address) {
          throw new Error("No TRC20 address set for withdrawal");
        }
        
        // In a real app, this would just create a withdrawal request
        // For this demo, we'll deduct from balance immediately but create a pending request
        const updatedUser = {
          ...user,
          balance: user.balance - amount
        };
        setUser(updatedUser);
        localStorage.setItem("wealthUser", JSON.stringify(updatedUser));
        
        // Create withdrawal request
        const withdrawalRequestEvent = new CustomEvent('newWithdrawalRequest', { 
          detail: { 
            userId: user.id, 
            amount: amount,
            trc20Address: user.trc20Address
          } 
        });
        window.dispatchEvent(withdrawalRequestEvent);
        
        toast.success(`Withdrawal request for $${amount} submitted`);
      }
    } catch (error: any) {
      toast.error(error.message || "Withdrawal request failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrc20Address = async (address: string) => {
    setIsLoading(true);
    try {
      // Validate TRC20 address - in a real app, you'd have proper validation
      if (!address || address.length < 30) {
        throw new Error("Invalid TRC20 address");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = {
          ...user,
          trc20Address: address
        };
        setUser(updatedUser);
        localStorage.setItem("wealthUser", JSON.stringify(updatedUser));
        toast.success("TRC20 address updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update TRC20 address");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      deposit, 
      requestWithdrawal,
      updateTrc20Address
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
