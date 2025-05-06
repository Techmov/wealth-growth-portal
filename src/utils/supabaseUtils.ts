
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
    const { error } = await supabase.functions.invoke('increment', {
      body: { row_id: rowId, amount, table, column }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error incrementing ${column} in ${table}:`, error);
    throw error;
  }
}
