
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

// Investment type from Supabase - using snake_case to match database
export interface Investment {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  starting_value: number;
  current_value: number;
  final_value: number;
  status: string; // Changed from union type to string to match database
  last_profit_claim_date?: string;
  daily_growth_rate: number;
  created_at: string;
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
  userName?: string;
  userEmail?: string;
  username?: string;
  withdrawalSource?: 'profit' | 'referral_bonus';
  feeAmount?: number;
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
  trc20Address?: string; // Changed from trc20_address to match camelCase
  withdrawalPassword?: string;
  role?: 'user' | 'admin';
  createdAt: Date;
  username?: string;
  escrowedAmount?: number;
};

// Updated withdrawal statistics type
export interface WithdrawalStats {
  availableWithdrawal: number;
  profitAmount: number;
  referralBonus: number;
  pendingWithdrawals: number;
  escrowedAmount: number;
  totalWithdrawn: number; // Added missing property
}
