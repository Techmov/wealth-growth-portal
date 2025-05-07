
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
      // Try using the Edge Function if available
      const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
        body: { action: 'get_all_users' }
      });
      
      if (!functionError && functionData?.success) {
        return functionData.data;
      }
      
      // Fall back to direct database query
      console.log("Falling back to direct query for getAllUsers");
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
      // Try using the Edge Function if available
      const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
        body: { action: 'get_pending_deposits' }
      });
      
      if (!functionError && functionData?.success) {
        return functionData.data;
      }
      
      // Fall back to direct database query
      console.log("Falling back to direct query for getPendingDeposits");
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
      // Try using the Edge Function if available
      const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
        body: { action: 'get_admin_plans' }
      });
      
      if (!functionError && functionData?.success) {
        return functionData.data;
      }
      
      // Fall back to direct database query
      console.log("Falling back to direct query for getAdminPlans");
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
  }
};
