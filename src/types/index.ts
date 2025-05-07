
import { Database } from "@/integrations/supabase/types";

// Profile type from Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Products type from Supabase
export interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  duration: number;
  growthRate: number;
  risk: 'low' | 'medium' | 'high';
  active: boolean;
}

// Investment type from Supabase
export interface Investment {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  startingValue: number;
  currentValue: number;
  finalValue: number;
  status: 'active' | 'completed' | 'cancelled';
  lastProfitClaimDate?: Date;
}

// Transaction type from Supabase
export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral' | 'profit';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  date: Date;
  description?: string;
  trc20Address?: string;
  txHash?: string;
  depositScreenshot?: string;
  rejectionReason?: string;
}

// WithdrawalRequest type from Supabase
export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  trc20Address: string;
  txHash?: string;
  rejectionReason?: string;
  // Additional fields for UI display from join queries
  userName?: string;
  username?: string;
  userEmail?: string;
}

// Helper types for UI components
export type AdminStats = {
  totalDeposits: number;
  totalWithdrawals: number;
  totalReferralBonus: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalUsers: number;
};

export type Downline = {
  id: string;
  username: string;
  totalInvested: number;
  bonusGenerated: number;
  date: Date;
};

// User type for auth context
export type User = {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  referralBonus: number;
  trc20Address?: string;
  withdrawalPassword?: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  username?: string;
};
