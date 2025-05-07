
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
    escrowedAmount: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Call the database function to get available withdrawal amount
      const { data: availableData, error: availableError } = await supabase.rpc(
        'calculate_available_withdrawal',
        { user_id: user.id }
      );

      if (availableError) throw availableError;

      // Get withdrawal stats from the view we created
      const { data: statsData, error: statsError } = await supabase
        .from('user_withdrawal_stats')
        .select('profit_amount, referral_bonus, pending_withdrawals, escrowed_amount')
        .eq('user_id', user.id)
        .single();

      if (statsError) throw statsError;

      setStats({
        availableWithdrawal: availableData || 0,
        profitAmount: statsData?.profit_amount || 0,
        referralBonus: statsData?.referral_bonus || 0,
        pendingWithdrawals: statsData?.pending_withdrawals || 0,
        escrowedAmount: statsData?.escrowed_amount || 0
      });
    } catch (error: any) {
      console.error('Error fetching withdrawal stats:', error);
      toast.error('Failed to load withdrawal statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time listener for profile changes
    if (user) {
      const channel = supabase
        .channel('withdrawal-stats-changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => {
            fetchStats();
          }
        )
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${user.id}`
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
