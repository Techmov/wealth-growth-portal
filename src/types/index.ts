
// Re-export auth types from types/auth
export * from './auth';

// Transaction types
export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: Date;
  description?: string;
  trc20Address?: string;
  txHash?: string;
  depositScreenshot?: string;
  rejectionReason?: string;
}

// Investment types
export interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  duration: number;
  growthRate: number;
  risk: 'low' | 'medium' | 'high';
}

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
}

// Withdrawal request type
export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  trc20Address: string;
  txHash?: string;
  rejectionReason?: string;
}

// Downline type for referrals
export interface Downline {
  id: string;
  username: string;
  totalInvested: number;
  bonusGenerated: number;
  date: Date;
}

// Admin stats type
export interface AdminStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalReferralBonus: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalUsers: number;
}
