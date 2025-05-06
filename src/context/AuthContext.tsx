import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Profile } from "@/types/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { User as AppUser } from "@/types";

interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<Profile>) => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => Promise<void>;
  updateTrc20Address: (address: string) => Promise<void>;
  deposit: (amount: number, txHash: string, screenshot?: File) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Function to fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
        
        // Create an AppUser from the profile data
        const appUser: AppUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          balance: data.balance || 0,
          totalInvested: data.total_invested || 0,
          totalWithdrawn: data.total_withdrawn || 0,
          referralBonus: data.referral_bonus || 0,
          referralCode: data.referral_code,
          referredBy: data.referred_by,
          trc20Address: data.trc20_address,
          withdrawalPassword: data.withdrawal_password,
          createdAt: new Date(data.created_at || Date.now()),
          role: data.role as 'user' | 'admin',
          username: data.username
        };
        
        setUser(appUser);
      } else {
        // If no profile found but user exists, we might need to create one
        console.log("No profile found for user", userId);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      setIsLoading(false);
    }
  }, []);

  // Set up authentication state listener
  useEffect(() => {
    setIsLoading(true);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase auth
        setTimeout(() => {
          fetchProfile(initialSession.user.id);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Function to update user data in application state
  const updateUser = async (userData: Partial<AppUser>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Update local state
    setUser({...user, ...userData});
    return Promise.resolve();
  };

  // Login function using Supabase auth
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (data?.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        
        // Navigation will be handled by auth state change
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function using Supabase auth - Updated to handle DB errors
  const signup = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      
      // Generate a unique referral code client-side as fallback
      const userReferralCode = referralCode || Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            referral_code: userReferralCode
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Handle successful signup
      if (data?.user) {
        console.log("User signed up successfully, creating profile manually");
        
        // Always create profile manually since the database trigger might fail
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: name,
            email: email,
            username: `user_${data.user.id.substring(0, 8)}`,
            referral_code: userReferralCode,
            referred_by: referralCode || null,
            balance: 0,
            total_invested: 0,
            total_withdrawn: 0,
            referral_bonus: 0,
            role: 'user'
          }, { onConflict: 'id' });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            title: "Profile Creation Issue",
            description: "Your account was created but there might be an issue with your profile. Please contact support if you experience any problems.",
            variant: "warning",
          });
        } else {
          toast({
            title: "Signup Successful",
            description: "Your account has been created successfully.",
          });
          
          // Fetch the profile right away
          await fetchProfile(data.user.id);
        }
      }
      
      // Navigation will be handled by auth state change
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      // Provide more specific error messages
      if (error.message && error.message.includes("Database error saving new user")) {
        errorMessage = "There was an issue creating your account. Please try again or contact support.";
      } else if (error.message && error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Please login instead.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using Supabase auth
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigation will be handled by auth state change
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<Profile>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Refresh profile data
      fetchProfile(user.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Update TRC20 address function
  const updateTrc20Address = async (address: string) => {
    try {
      await updateProfile({ trc20_address: address });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Deposit function
  const deposit = async (amount: number, txHash: string, screenshot?: File) => {
    if (!user || !profile) {
      throw new Error("User not authenticated");
    }
    
    try {
      let screenshotUrl: string | undefined = undefined;
      
      // If screenshot is provided, upload it to storage
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('deposit_screenshots')
          .upload(fileName, screenshot);
        
        if (uploadError) {
          toast({
            title: "Upload Failed",
            description: uploadError.message,
            variant: "destructive",
          });
          throw uploadError;
        }
        
        // Get public URL for the screenshot
        const { data: urlData } = supabase.storage
          .from('deposit_screenshots')
          .getPublicUrl(fileName);
        
        screenshotUrl = urlData.publicUrl;
      }
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending',
          type: 'deposit',
          tx_hash: txHash,
          deposit_screenshot: screenshotUrl
        });
      
      if (transactionError) {
        toast({
          title: "Deposit Failed",
          description: transactionError.message,
          variant: "destructive",
        });
        throw transactionError;
      }
      
      toast({
        title: "Deposit Received",
        description: "Your deposit request has been received and is pending approval.",
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Request withdrawal function
  const requestWithdrawal = async (amount: number) => {
    if (!user || !profile) {
      throw new Error("User not authenticated");
    }
    
    try {
      if (amount > (profile.balance || 0)) {
        toast({
          title: "Withdrawal Failed",
          description: "Insufficient balance",
          variant: "destructive",
        });
        return Promise.reject(new Error("Insufficient balance"));
      }
      
      if (!profile.trc20_address) {
        toast({
          title: "Withdrawal Failed",
          description: "Please set your TRC20 address before requesting withdrawal",
          variant: "destructive",
        });
        return Promise.reject(new Error("TRC20 address not set"));
      }
      
      // Create withdrawal request
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending',
          trc20_address: profile.trc20_address
        });
      
      if (error) {
        toast({
          title: "Withdrawal Request Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: (profile.balance || 0) - amount
        })
        .eq('id', user.id);
      
      if (updateError) {
        toast({
          title: "Balance Update Failed",
          description: updateError.message,
          variant: "destructive",
        });
        throw updateError;
      }
      
      // Refresh profile data
      fetchProfile(user.id);
      
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted for approval.`,
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
        profile,
        session,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
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
