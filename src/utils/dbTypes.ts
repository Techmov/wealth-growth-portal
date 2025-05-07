
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Offer, Feature } from "@/types/content";

/**
 * Helper function for type-safe database operations on custom tables
 * that aren't yet reflected in the generated types
 */
export const db = {
  /**
   * Type-safe access to the promotions table
   */
  promotions: {
    /**
     * Select promotions with proper typing
     */
    select: () => 
      supabase.from('promotions').select('*') as unknown as Promise<{
        data: Promotion[] | null;
        error: Error | null;
      }>,
    
    /**
     * Insert a promotion with proper typing
     */
    insert: (promotion: Partial<Promotion>) => 
      supabase.from('promotions').insert(promotion) as unknown as Promise<{
        data: Promotion[] | null;
        error: Error | null;
      }>,
    
    /**
     * Update a promotion with proper typing
     */
    update: (promotion: Partial<Promotion>) => 
      supabase.from('promotions').update(promotion),
    
    /**
     * Delete a promotion by ID
     */
    delete: (id: string) => 
      supabase.from('promotions').delete().eq('id', id)
  },

  /**
   * Type-safe access to the offers table
   */
  offers: {
    /**
     * Select offers with proper typing
     */
    select: () => 
      supabase.from('offers').select('*') as unknown as Promise<{
        data: Offer[] | null;
        error: Error | null;
      }>,
    
    /**
     * Insert an offer with proper typing
     */
    insert: (offer: Partial<Offer>) => 
      supabase.from('offers').insert(offer) as unknown as Promise<{
        data: Offer[] | null;
        error: Error | null;
      }>,
    
    /**
     * Update an offer with proper typing
     */
    update: (offer: Partial<Offer>) => 
      supabase.from('offers').update(offer),
    
    /**
     * Delete an offer by ID
     */
    delete: (id: string) => 
      supabase.from('offers').delete().eq('id', id)
  },

  /**
   * Type-safe access to the features table
   */
  features: {
    /**
     * Select features with proper typing
     */
    select: () => 
      supabase.from('features').select('*') as unknown as Promise<{
        data: Feature[] | null;
        error: Error | null;
      }>,
    
    /**
     * Insert a feature with proper typing
     */
    insert: (feature: Partial<Feature>) => 
      supabase.from('features').insert(feature) as unknown as Promise<{
        data: Feature[] | null;
        error: Error | null;
      }>,
    
    /**
     * Update a feature with proper typing
     */
    update: (feature: Partial<Feature>) => 
      supabase.from('features').update(feature),
    
    /**
     * Delete a feature by ID
     */
    delete: (id: string) => 
      supabase.from('features').delete().eq('id', id)
  }
};

/**
 * Helper function to convert database date strings to JavaScript Date objects
 */
export function formatDates<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  
  const formattedItem = { ...item };
  
  // Look for date fields and convert them
  Object.keys(formattedItem).forEach(key => {
    const value = (formattedItem as any)[key];
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      (formattedItem as any)[key] = new Date(value);
    }
  });
  
  return formattedItem;
}
