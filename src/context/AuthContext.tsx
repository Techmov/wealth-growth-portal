
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateTrc20Address: (address: string) => Promise<void>;
  deposit: (amount: number, txHash: string, screenshot?: File) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  isAdmin: boolean;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants
const SESSION_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
const USER_STORAGE_KEY = "user_session";
const SESSION_EXPIRY_KEY = "session_expiry";

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
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Function to set up session timeout
  const setupSessionTimeout = useCallback(() => {
    // Clear any existing timer
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }
    
    // Set the expiry time - 1 hour from now
    const expiryTime = Date.now() + SESSION_EXPIRY_TIME;
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    
    // Set up the timer to log out when the session expires
    const timer = setTimeout(() => {
      logout();
      toast("Session Expired", {
        description: "Your session has expired. Please log in again.",
      });
    }, SESSION_EXPIRY_TIME);
    
    setSessionTimer(timer);
  }, []);

  // Check for existing user session on load
  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const expiryTime = localStorage.getItem(SESSION_EXPIRY_KEY);
      
      if (storedUser && expiryTime) {
        const parsedUser = JSON.parse(storedUser);
        const remainingTime = parseInt(expiryTime) - Date.now();
        
        // If session is still valid
        if (remainingTime > 0) {
          setUser(parsedUser);
          
          // Check if user is admin
          if (parsedUser.email === ADMIN_EMAIL) {
            setIsAdmin(true);
          }
          
          // Set up a new timer for the remaining time
          const timer = setTimeout(() => {
            logout();
            toast("Session Expired", {
              description: "Your session has expired. Please log in again.",
            });
          }, remainingTime);
          
          setSessionTimer(timer);
        } else {
          // Session expired, clear storage
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(SESSION_EXPIRY_KEY);
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", "[]");
    }
    
    // Initialize other storage items
    if (!localStorage.getItem("transactions")) {
      localStorage.setItem("transactions", "[]");
    }
    
    if (!localStorage.getItem("investments")) {
      localStorage.setItem("investments", "[]");
    }
    
    if (!localStorage.getItem("withdrawalRequests")) {
      localStorage.setItem("withdrawalRequests", "[]");
    }
    
    if (!localStorage.getItem("pendingDeposits")) {
      localStorage.setItem("pendingDeposits", "[]");
    }
    
    if (!localStorage.getItem("pendingWithdrawals")) {
      localStorage.setItem("pendingWithdrawals", "[]");
    }
    
    // Initialize payment gateway settings
    if (!localStorage.getItem("paymentSettings")) {
      const defaultSettings = {
        trc20Address: "TG3XXX...Default TRC20 Address",
        bep20Address: "0x123...Default BEP20 Address"
      };
      localStorage.setItem("paymentSettings", JSON.stringify(defaultSettings));
    }
    
    // Cleanup timer on unmount
    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
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
        
        // Store user in session storage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
        
        // Set up session timeout
        setupSessionTimeout();
        
        toast("Admin Login Successful", {
          description: "Welcome to the admin dashboard.",
        });
        
        navigate("/admin/dashboard");
        return;
      }

      // Regular user login - find user in our "database"
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        
        // Store user in session storage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
        
        // Set up session timeout
        setupSessionTimeout();
        
        toast("Login Successful", {
          description: `Welcome back, ${foundUser.name}!`,
        });
        
        navigate("/dashboard");
      } else {
        toast("Login Failed", {
          description: "Invalid credentials. User not found.",
          variant: "destructive",
        });
        
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast("Login Error", {
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        toast("Signup Failed", {
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        throw new Error("User already exists");
      }
      
      // Generate referral code
      const userReferralCode = `REF${Math.floor(Math.random() * 10000)}`;
      
      // Create transaction hash that will also serve as withdrawal password
      const txHash = `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        balance: 0,
        totalInvested: 0,
        totalWithdrawn: 0,
        referralBonus: 0,
        referralCode: userReferralCode,
        referredBy: referralCode || undefined,
        createdAt: new Date(),
        role: "user",
        username: email.split('@')[0],
        withdrawalPassword: txHash,
        trc20Address: ""
      };
      
      // Save user to "database"
      users.push(newUser);
      saveUsers(users);
      
      // Set current user
      setUser(newUser);
      
      // Store user in session storage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      // Set up session timeout
      setupSessionTimeout();
      
      // Dispatch event for admin dashboard
      window.dispatchEvent(new CustomEvent('userSignup', { detail: { user: newUser }}));
      
      toast("Signup Successful", {
        description: "You have successfully signed up.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast("Signup Error", {
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    setIsAdmin(false);
    
    // Clear session data
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    
    // Clear any active session timer
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    
    toast("Logged out", {
      description: "You have been successfully logged out.",
    });
    
    navigate("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update in session storage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Update user in the "database"
      const users = getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      saveUsers(updatedUsers);
    }
  };

  const updateTrc20Address = async (address: string) => {
    if (user) {
      try {
        // Update the user's TRC20 address
        const updatedUser = { ...user, trc20Address: address };
        setUser(updatedUser);
        
        // Update session storage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
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
        window.dispatchEvent(new CustomEvent('depositStatusChange', { 
          detail: { deposit: pendingDeposit } 
        }));
        
        toast("Deposit Received", {
          description: "Your deposit request has been received and is pending approval.",
        });
        
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not found"));
  };

  const requestWithdrawal = async (amount: number) => {
    if (user) {
      try {
        if (amount > user.balance) {
          return Promise.reject(new Error("Insufficient balance"));
        }
        
        if (!user.trc20Address) {
          return Promise.reject(new Error("Please set your TRC20 address before requesting withdrawal"));
        }
        
        // Create withdrawal request
        const withdrawalRequest = {
          id: `wd_${Date.now()}`,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          amount,
          status: "pending",
          date: new Date(),
          trc20Address: user.trc20Address
        };
        
        // Update user balance
        const updatedUser = {
          ...user,
          balance: user.balance - amount
        };
        
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // Update user in database
        const users = getUsers();
        const updatedUsers = users.map(u => 
          u.id === user.id ? updatedUser : u
        );
        saveUsers(updatedUsers);
        
        // Save withdrawal request
        const pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals") || "[]");
        pendingWithdrawals.push(withdrawalRequest);
        localStorage.setItem("pendingWithdrawals", JSON.stringify(pendingWithdrawals));
        
        // Add to user's withdrawals history
        const userWithdrawals = JSON.parse(localStorage.getItem(`withdrawals_${user.id}`) || "[]");
        userWithdrawals.push(withdrawalRequest);
        localStorage.setItem(`withdrawals_${user.id}`, JSON.stringify(userWithdrawals));
        
        // Notify admin dashboard
        window.dispatchEvent(new CustomEvent('withdrawalStatusChange', {
          detail: { withdrawal: withdrawalRequest }
        }));
        
        toast("Withdrawal Requested", {
          description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted for approval.`,
        });
        
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not found"));
  };

  const resetPassword = async (email: string) => {
    try {
      // Find user
      const users = getUsers();
      const userExists = users.some(u => u.email === email);
      
      if (!userExists) {
        return Promise.reject(new Error("No account found with this email address"));
      }
      
      // In a real app, we'd send an email with a reset link
      // For demo, we'll just show a success message
      toast("Reset Link Sent", {
        description: "If an account exists with this email, you'll receive a password reset link shortly.",
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
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
        isAdmin,
        resetPassword
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
