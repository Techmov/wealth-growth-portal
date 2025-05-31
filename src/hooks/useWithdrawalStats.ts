import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, WithdrawalStats } from '@/types';
import { toast } from 'sonner';
import { useRealtimeManager } from './useRealtimeManager';

export function useWithdrawalStats(user: User | null) {
  const [stats, setStats] = useState<WithdrawalStats>({
    availableWithdrawal: 0,
    profitAmount: 0,
    referralBonus: 0,
    pendingWithdrawals: 0,
    escrowedAmount: 0,
    totalWithdrawn: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance, total_invested, referral_bonus, escrowed_amount, total_withdrawn')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: pendingWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (withdrawalsError) throw withdrawalsError;

      const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      // Calculate profit amount (profit = balance - total invested)
      const profitAmount = Math.max(0, (profile.balance || 0) - (profile.total_invested || 0));

      // Calculate available withdrawal per your formula:
      // availableWithdrawal = balance + profitAmount + referral_bonus - escrowed_amount
      const availableWithdrawal =
        (profile.balance || 0) +
        profitAmount +
        (profile.referral_bonus || 0) -
        (profile.escrowed_amount || 0);

      setStats({
        availableWithdrawal: Math.max(0, availableWithdrawal),
        profitAmount: profitAmount,
        referralBonus: profile.referral_bonus || 0,
        pendingWithdrawals: pendingAmount,
        escrowedAmount: profile.escrowed_amount || 0,
        totalWithdrawn: profile.total_withdrawn || 0,
      });
    } catch (error: any) {
      console.error('Error fetching withdrawal stats:', error.message);
      toast.error('Failed to load withdrawal statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const subscriptions = user
    ? [
        {
          channel: `withdrawal-stats-${user.id}`,
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`,
          callback: fetchStats,
        },
        {
          channel: `profile-stats-${user.id}`,
          table: 'profiles',
          filter: `id=eq.${user.id}`,
          callback: fetchStats,
        },
      ]
    : [];

  useRealtimeManager(subscriptions);

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}
