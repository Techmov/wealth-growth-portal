
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";

// Temporary mock data - in a real app this would be handled by backend
import { User } from "@/types";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
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

  const deposit = async (amount: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = {
          ...user,
          balance: user.balance + amount
        };
        setUser(updatedUser);
        localStorage.setItem("wealthUser", JSON.stringify(updatedUser));
        toast.success(`Successfully deposited $${amount}`);
      }
    } catch (error) {
      toast.error("Deposit failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async (amount: number) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        if (amount > user.balance) {
          throw new Error("Insufficient balance");
        }
        
        const updatedUser = {
          ...user,
          balance: user.balance - amount,
          totalWithdrawn: user.totalWithdrawn + amount
        };
        setUser(updatedUser);
        localStorage.setItem("wealthUser", JSON.stringify(updatedUser));
        toast.success(`Successfully withdrew $${amount}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, deposit, withdraw }}>
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
