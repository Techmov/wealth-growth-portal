
import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateTrc20Address: (address: string) => Promise<void>;
  deposit: (amount: number, txHash: string, screenshot?: File) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Signup Successful",
          description: "You have successfully signed up.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Signup Failed",
          description: data.message || "Failed to create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  // Add the updateUser method
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Add the updateTrc20Address method
  const updateTrc20Address = async (address: string) => {
    if (user) {
      try {
        // In a real app, we would make an API call here
        // For now, we'll just update the local user state
        const updatedUser = { ...user, trc20Address: address };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not found"));
  };

  // Add the deposit method
  const deposit = async (amount: number, txHash: string, screenshot?: File) => {
    if (user) {
      try {
        // In a real app, we would make an API call here
        // For now, we'll just update the local user state with a pending deposit
        toast({
          title: "Deposit Received",
          description: "Your deposit request has been received and is pending approval.",
        });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not found"));
  };

  // Add the requestWithdrawal method
  const requestWithdrawal = async (amount: number) => {
    if (user) {
      try {
        if (amount > user.balance) {
          return Promise.reject(new Error("Insufficient balance"));
        }
        
        // In a real app, we would make an API call here
        // For now, we'll just update the local user state
        toast({
          title: "Withdrawal Requested",
          description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted for approval.`,
        });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not found"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        updateTrc20Address,
        deposit,
        requestWithdrawal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
