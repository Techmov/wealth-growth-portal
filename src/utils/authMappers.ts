
import { Profile } from "@/types/supabase";
import { User as AppUser } from "@/types";

export const mapProfileToUser = (profile: Profile): AppUser => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    balance: profile.balance || 0,
    totalInvested: profile.total_invested || 0,
    totalWithdrawn: profile.total_withdrawn || 0,
    referralBonus: profile.referral_bonus || 0,
    referralCode: profile.referral_code,
    trc20Address: profile.trc20_address,
    withdrawalPassword: profile.withdrawal_password,
    createdAt: new Date(profile.created_at || Date.now()),
    role: profile.role as 'user' | 'admin',
    username: profile.username
  };
};
