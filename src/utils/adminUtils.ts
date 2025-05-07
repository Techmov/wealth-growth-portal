
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
      console.log("Attempting to fetch all users via RPC");
      // First try using the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users');
      
      if (rpcError) {
        console.warn("RPC error getting all users:", rpcError);
        console.log("Falling back to direct database query");
        
        // Fall back to direct database query
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) throw error;
        return data;
      }
      
      return rpcData;
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
      console.log("Attempting to fetch pending deposits via RPC");
      // First try using the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_pending_deposits');
      
      if (rpcError) {
        console.warn("RPC error getting pending deposits:", rpcError);
        console.log("Falling back to direct database query");
        
        // Fall back to direct database query
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'deposit')
          .eq('status', 'pending');
        
        if (error) throw error;
        return data;
      }
      
      return rpcData;
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
      console.log("Attempting to fetch admin plans via RPC");
      // First try using the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_plans');
      
      if (rpcError) {
        console.warn("RPC error getting admin plans:", rpcError);
        console.log("Falling back to direct database query");
        
        // Fall back to direct database query
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      }
      
      return rpcData;
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
      console.log("Attempting to fetch pending withdrawals via RPC");
      // First try using the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_pending_withdrawals');
      
      if (rpcError) {
        console.warn("RPC error getting pending withdrawals:", rpcError);
        console.log("Falling back to direct database query");
        
        // Fall back to direct database query with nested profiles selection
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
      }
      
      return rpcData;
    } catch (error) {
      console.error("Error getting pending withdrawals:", error);
      throw error;
    }
  }
};
