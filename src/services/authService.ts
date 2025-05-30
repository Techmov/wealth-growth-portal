
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export async function signUpUser(userData: {
  email: string;
  password: string;
  name: string;
  username: string;
  referredBy?: string;
}) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          username: userData.username,
        }
      }
    });

    if (authError) throw authError;

    // Generate a unique referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create profile record with referral handling
    const profileData = {
      id: authData.user?.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      referral_code: referralCode,
      referred_by: userData.referredBy || null,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) throw profileError;

    return { user: authData.user, profile: profileData };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function depositFunds(userId: string, amount: number, txHash: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'deposit',
          amount: amount,
          status: 'pending',
          tx_hash: txHash,
          description: `Deposit of $${amount} USDT`,
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Deposit error:', error);
    throw error;
  }
}

export async function requestWithdrawal(
  userId: string,
  amount: number,
  trc20Address: string,
  withdrawalSource: string = 'profit'
) {
  try {
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_user_id: userId,
      p_amount: amount,
      p_trc20_address: trc20Address,
      p_withdrawal_source: withdrawalSource,
      // Removed p_fee_amount since it doesn't exist in the function signature
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Withdrawal request error:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

export async function bindTrc20Address(userId: string, trc20Address: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ trc20_address: trc20Address })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('TRC20 address binding error:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      username: data.username,
      referralCode: data.referral_code,
      balance: data.balance,
      totalInvested: data.total_invested,
      totalWithdrawn: data.total_withdrawn,
      referralBonus: data.referral_bonus,
      trc20Address: data.trc20_address, // Fixed property name
      withdrawalPassword: data.withdrawal_password,
      role: data.role,
      createdAt: new Date(data.created_at),
      escrowedAmount: data.escrowed_amount,
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}
