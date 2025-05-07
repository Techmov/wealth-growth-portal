
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility functions for admin operations
 */
export const adminUtils = {
  /**
   * Get all users in the system (admin only)
   */
  getAllUsers: async () => {
    try {
      // Use direct database query instead of RPC
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },
  
  /**
   * Get pending deposits (admin only)
   */
  getPendingDeposits: async () => {
    try {
      // Use direct database query instead of RPC
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting pending deposits:", error);
      throw error;
    }
  },
  
  /**
   * Get all investment plans (admin only)
   */
  getAdminPlans: async () => {
    try {
      // Use direct database query instead of RPC
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting admin plans:", error);
      throw error;
    }
  },
  
  /**
   * Get pending withdrawals with user info (admin only)
   */
  getPendingWithdrawals: async () => {
    try {
      // Use direct database query instead of RPC
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            username
          )
        `)
        .eq('status', 'pending')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting pending withdrawals:", error);
      throw error;
    }
  }
};
