
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { Profile } from "./supabase";

// Types for the auth context
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginSuccess: boolean;
  resetLoginSuccess: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; session?: Session }>;
  signup: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateTrc20Address: (address: string, withdrawalPassword?: string) => Promise<void>;
  requestWithdrawal: (amount: number, withdrawalPassword: string) => Promise<string>;
  fetchProfile: (userId: string) => Promise<void>;
  deposit: (amount: number, txHash: string) => Promise<void>;
}

// User credentials for login
export interface LoginCredentials {
  email: string;
  password: string;
}

// User credentials for signup
export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

// App user type (extended from Supabase user)
export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  referralBonus: number;
  referralCode: string;
  referredBy?: string | null; // Make this optional to match the User type from types.ts
  trc20Address?: string;
  withdrawalPassword?: string;
  createdAt: Date;
  role?: 'user' | 'admin'; // Make role optional to match the User type from types.ts
  username?: string;
}
