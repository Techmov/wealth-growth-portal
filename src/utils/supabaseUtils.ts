
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to increment a numeric value in a table
 * @param table The table name
 * @param column The column to increment
 * @param rowId The row ID
 * @param amount The amount to increment by
 */
export async function incrementValue(
  table: "profiles" | "investments" | "products" | "transactions" | "withdrawal_requests", 
  column: string, 
  rowId: string, 
  amount: number
): Promise<void> {
  try {
    // Get the current value
    const { data: currentValueData, error: fetchError } = await supabase
      .from(table)
      .select(column)
      .eq('id', rowId)
      .single();
    
    if (fetchError || currentValueData === null) {
      console.error(`Error fetching ${column} from ${table}:`, fetchError);
      throw fetchError || new Error(`Record not found in ${table}`);
    }
    
    // Calculate new value
    const currentValue = currentValueData[column] || 0;
    const newValue = currentValue + amount;
    
    // Update the value
    const { error: updateError } = await supabase
      .from(table)
      .update({ [column]: newValue })
      .eq('id', rowId);
    
    if (updateError) {
      console.error(`Error incrementing ${column} in ${table}:`, updateError);
      throw updateError;
    }
  } catch (error) {
    console.error(`Error incrementing ${column} in ${table}:`, error);
    throw error;
  }
}
