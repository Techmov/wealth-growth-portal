
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
    insert: (promotion: Partial<Promotion>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const promotionToInsert = { ...promotion };
      return supabase.from('promotions').insert(promotionToInsert);
    },
    
    /**
     * Update a promotion with proper typing
     */
    update: (promotion: Partial<Promotion>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const promotionToUpdate = { ...promotion };
      return supabase.from('promotions').update(promotionToUpdate);
    },
    
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
    insert: (offer: Partial<Offer>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const offerToInsert = { ...offer };
      return supabase.from('offers').insert(offerToInsert);
    },
    
    /**
     * Update an offer with proper typing
     */
    update: (offer: Partial<Offer>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const offerToUpdate = { ...offer };
      return supabase.from('offers').update(offerToUpdate);
    },
    
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
    insert: (feature: Partial<Feature>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const featureToInsert = { ...feature };
      return supabase.from('features').insert(featureToInsert);
    },
    
    /**
     * Update a feature with proper typing
     */
    update: (feature: Partial<Feature>) => {
      // Make sure we're sending string dates to Supabase, not Date objects
      const featureToUpdate = { ...feature };
      return supabase.from('features').update(featureToUpdate);
    },
    
    /**
     * Delete a feature by ID
     */
    delete: (id: string) => 
      supabase.from('features').delete().eq('id', id)
  }
};

/**
 * Helper function to convert date strings to JavaScript Date objects for display purposes
 * This won't be used for database operations, only for displaying dates in the UI
 */
export function formatDatesForDisplay<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  
  const formattedItem = { ...item } as any;
  
  // Look for date fields and convert them
  Object.keys(formattedItem).forEach(key => {
    const value = formattedItem[key];
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      formattedItem[key] = new Date(value);
    }
  });
  
  return formattedItem as T;
}

/**
 * Helper function that maintains date fields as strings from the database
 * This is needed because our types now expect string dates (not Date objects)
 */
export function formatDates<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  return { ...item };
}
