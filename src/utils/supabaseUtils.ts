
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to increment a numeric value in a table
 * @param table The table name
 * @param column The column to increment
 * @param rowId The row ID
 * @param amount The amount to increment by
 */
export async function incrementValue(
  table: string, 
  column: string, 
  rowId: string, 
  amount: number
): Promise<void> {
  try {
    // Use the supabase API directly to update the column
    const { error } = await supabase
      .from(table)
      .update({ [column]: supabase.rpc('get_current_value', { 
        p_table: table, 
        p_column: column, 
        p_id: rowId 
      }).then(val => val + amount) })
      .eq('id', rowId);
    
    if (error) {
      console.error(`Error incrementing ${column} in ${table}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error incrementing ${column} in ${table}:`, error);
    throw error;
  }
}
