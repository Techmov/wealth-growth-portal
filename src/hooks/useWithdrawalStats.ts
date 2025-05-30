import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, WithdrawalStats } from '@/types';
import { toast } from 'sonner';

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

      const [statsRes, totalWithdrawnRes] = await Promise.all([
        supabase
          .from('user_withdrawal_stats')
          .select('profit_amount, referral_bonus, pending_withdrawals, escrowed_amount, balance') // `balance` now reflects availableWithdrawal
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('withdrawal_requests')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'approved'),
      ]);

      if (statsRes.error || totalWithdrawnRes.error) {
        throw statsRes.error || totalWithdrawnRes.error;
      }

      const totalWithdrawn = totalWithdrawnRes.data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;

      setStats({
        availableWithdrawal: statsRes.data?.balance || 0, // 🆕 reflects full balance
        profitAmount: statsRes.data?.profit_amount || 0,
        referralBonus: statsRes.data?.referral_bonus || 0,
        pendingWithdrawals: statsRes.data?.pending_withdrawals || 0,
        escrowedAmount: statsRes.data?.escrowed_amount || 0,
        totalWithdrawn,
      });
    } catch (error: any) {
      console.error('Error fetching withdrawal stats:', error.message);
      toast.error('Failed to load withdrawal statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (user) {
      const channel = supabase
        .channel('withdrawal-stats-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { stats, isLoading, refetch: fetchStats };
}
