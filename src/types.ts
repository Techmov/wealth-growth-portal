
export type User = {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalInvested: number;
  totalWithdrawn: number;
  referralBonus: number;
  referralCode: string;
  referredBy?: string;
  trc20Address?: string;
  withdrawalPassword?: string;
  createdAt: Date;
  role?: 'user' | 'admin';
};

export type Investment = {
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
};

export type Product = {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  duration: number; // in days
  growthRate: number; // percentage
  risk: 'low' | 'medium' | 'high';
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  date: Date;
  description?: string;
  trc20Address?: string;
  txHash?: string;
  depositScreenshot?: string; // URL for deposit screenshot
  rejectionReason?: string; // Reason for rejection
};

export type WithdrawalRequest = {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  trc20Address: string;
  txHash?: string;
  rejectionReason?: string; // Reason for rejection
};

export type AdminStats = {
  totalDeposits: number;
  totalWithdrawals: number;
  totalReferralBonus: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalUsers: number;
};
