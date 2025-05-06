
import { Database } from "@/integrations/supabase/types";

// Profile type from Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Products type from Supabase
export type Product = Database['public']['Tables']['products']['Row'];

// Investment type from Supabase
export type Investment = Database['public']['Tables']['investments']['Row'];

// Transaction type from Supabase
export type Transaction = Database['public']['Tables']['transactions']['Row'];

// WithdrawalRequest type from Supabase
export type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Row'];

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
