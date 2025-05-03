
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
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials
const ADMIN_EMAIL = "Caltech@gmail.com";
const ADMIN_PASSWORD = "Caltech2030";

// Get users from localStorage
const getUsers = () => {
  return JSON.parse(localStorage.getItem("users") || "[]");
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("adminUsers", JSON.stringify(users)); // For admin panel
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Check if user is admin
      if (parsedUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    }
    setIsLoading(false);
    
    // Initialize users storage if it doesn't exist
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", "[]");
      localStorage.setItem("adminUsers", "[]");
    }
    
    // Initialize transaction storage
    if (!localStorage.getItem("transactions")) {
      localStorage.setItem("transactions", "[]");
    }
    
    // Initialize investments storage
    if (!localStorage.getItem("investments")) {
      localStorage.setItem("investments", "[]");
    }
    
    // Initialize withdrawal requests storage
    if (!localStorage.getItem("withdrawalRequests")) {
      localStorage.setItem("withdrawalRequests", "[]");
    }
    
    // Initialize pending deposits storage
    if (!localStorage.getItem("pendingDeposits")) {
      localStorage.setItem("pendingDeposits", "[]");
    }
    
    // Initialize pending withdrawals storage
    if (!localStorage.getItem("pendingWithdrawals")) {
      localStorage.setItem("pendingWithdrawals", "[]");
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if the user is admin
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: "admin-id",
          name: "Admin",
          email: ADMIN_EMAIL,
          balance: 0,
          totalInvested: 0,
          totalWithdrawn: 0,
          referralBonus: 0,
          referralCode: "ADMIN",
          createdAt: new Date(),
          role: "admin"
        };
        
        setUser(adminUser);
        setIsAdmin(true);
        localStorage.setItem("user", JSON.stringify(adminUser));
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        
        navigate("/admin/dashboard");
        return;
      }

      // Regular user login - find user in our "database"
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        // In a real app, we would verify password hash here
        // For demo, we'll just check if the email exists
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. User not found.",
          variant: "destructive",
        });
        
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        toast({
          title: "Signup Failed",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        throw new Error("User already exists");
      }
      
      // Generate referral code
      const referralCode = `REF${Math.floor(Math.random() * 10000)}`;
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        balance: 0,
        totalInvested: 0,
        totalWithdrawn: 0,
        referralBonus: 0,
        referralCode,
        createdAt: new Date(),
        role: "user"
      };
      
      // Save user to "database"
      users.push(newUser);
      saveUsers(users);
      
      // Set current user
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // Dispatch event for admin dashboard
      window.dispatchEvent(new CustomEvent('userSignup'));
      
      toast({
        title: "Signup Successful",
        description: "You have successfully signed up.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
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
      
      // Update user in the "database"
      const users = getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      saveUsers(updatedUsers);
    }
  };

  // Add the updateTrc20Address method
  const updateTrc20Address = async (address: string) => {
    if (user) {
      try {
        // Update the user's TRC20 address
        const updatedUser = { ...user, trc20Address: address };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update user in the "database"
        const users = getUsers();
        const updatedUsers = users.map(u => 
          u.id === user.id ? updatedUser : u
        );
        saveUsers(updatedUsers);
        
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
        const screenshotUrl = screenshot ? URL.createObjectURL(screenshot) : undefined;
        
        // Create a pending deposit
        const pendingDeposit = {
          id: `dep_${Date.now()}`,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          amount,
          status: "pending",
          date: new Date(),
          txHash,
          type: "deposit",
          depositScreenshot: screenshotUrl
        };
        
        // Save pending deposit to localStorage
        const pendingDeposits = JSON.parse(localStorage.getItem("pendingDeposits") || "[]");
        pendingDeposits.push(pendingDeposit);
        localStorage.setItem("pendingDeposits", JSON.stringify(pendingDeposits));
        
        // Notify admin dashboard
        window.dispatchEvent(new CustomEvent('depositStatusChange'));
        
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
        
        if (!user.trc20Address) {
          return Promise.reject(new Error("Please set your TRC20 address before requesting withdrawal"));
        }
        
        // Create withdrawal request event
        window.dispatchEvent(new CustomEvent('newWithdrawalRequest', {
          detail: {
            userId: user.id,
            amount,
            trc20Address: user.trc20Address
          }
        }));
        
        // Update user balance
        const updatedUser = {
          ...user,
          balance: user.balance - amount
        };
        
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update user in database
        const users = getUsers();
        const updatedUsers = users.map(u => 
          u.id === user.id ? updatedUser : u
        );
        saveUsers(updatedUsers);
        
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
        requestWithdrawal,
        isAdmin
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
