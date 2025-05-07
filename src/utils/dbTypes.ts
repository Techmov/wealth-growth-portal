
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
     * Ensures required fields are present
     */
    insert: (promotion: Partial<Promotion> & { title: string, description: string }) => {
      // Additional validation check for safety
      if (!promotion.title || !promotion.description) {
        throw new Error('Title and description are required for promotions');
      }
      
      return supabase.from('promotions').insert(promotion);
    },
    
    /**
     * Update a promotion with proper typing
     * Ensures required fields are present
     */
    update: (promotion: Partial<Promotion> & { title: string, description: string }) => {
      // Ensure we have an ID for updates
      if (!promotion.id) {
        throw new Error('ID is required for updating a promotion');
      }
      
      return supabase
        .from('promotions')
        .update(promotion)
        .eq('id', promotion.id);
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
     * Ensures required fields are present
     */
    insert: (offer: Partial<Offer> & { title: string, description: string }) => {
      // Additional validation check for safety
      if (!offer.title || !offer.description) {
        throw new Error('Title and description are required for offers');
      }
      
      return supabase.from('offers').insert(offer);
    },
    
    /**
     * Update an offer with proper typing
     * Ensures required fields are present
     */
    update: (offer: Partial<Offer> & { title: string, description: string }) => {
      // Ensure we have an ID for updates
      if (!offer.id) {
        throw new Error('ID is required for updating an offer');
      }
      
      return supabase
        .from('offers')
        .update(offer)
        .eq('id', offer.id);
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
     * Ensures required fields are present
     */
    insert: (feature: Partial<Feature> & { title: string, description: string, icon_name: string }) => {
      // Additional validation check for safety
      if (!feature.title || !feature.description || !feature.icon_name) {
        throw new Error('Title, description, and icon_name are required for features');
      }
      
      return supabase.from('features').insert(feature);
    },
    
    /**
     * Update a feature with proper typing
     * Ensures required fields are present
     */
    update: (feature: Partial<Feature> & { title: string, description: string, icon_name: string }) => {
      // Ensure we have an ID for updates
      if (!feature.id) {
        throw new Error('ID is required for updating a feature');
      }
      
      return supabase
        .from('features')
        .update(feature)
        .eq('id', feature.id);
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
