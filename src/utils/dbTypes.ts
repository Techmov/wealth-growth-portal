
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
      // Validate required fields for insert
      if (!promotion.title || !promotion.description) {
        throw new Error('Title and description are required for promotions');
      }
      
      const promotionToInsert = { 
        ...promotion,
        // Ensure we're sending correct types to the database
        title: promotion.title,
        description: promotion.description
      };
      
      return supabase.from('promotions').insert(promotionToInsert);
    },
    
    /**
     * Update a promotion with proper typing
     */
    update: (promotion: Partial<Promotion>) => {
      // Ensure we have an ID for updates
      if (!promotion.id) {
        throw new Error('ID is required for updating a promotion');
      }
      
      const promotionToUpdate = { ...promotion };
      
      return supabase
        .from('promotions')
        .update(promotionToUpdate)
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
     */
    insert: (offer: Partial<Offer>) => {
      // Validate required fields for insert
      if (!offer.title || !offer.description) {
        throw new Error('Title and description are required for offers');
      }
      
      const offerToInsert = { 
        ...offer,
        // Ensure we're sending correct types to the database
        title: offer.title,
        description: offer.description
      };
      
      return supabase.from('offers').insert(offerToInsert);
    },
    
    /**
     * Update an offer with proper typing
     */
    update: (offer: Partial<Offer>) => {
      // Ensure we have an ID for updates
      if (!offer.id) {
        throw new Error('ID is required for updating an offer');
      }
      
      const offerToUpdate = { ...offer };
      
      return supabase
        .from('offers')
        .update(offerToUpdate)
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
     */
    insert: (feature: Partial<Feature>) => {
      // Validate required fields for insert
      if (!feature.title || !feature.description || !feature.icon_name) {
        throw new Error('Title, description, and icon_name are required for features');
      }
      
      const featureToInsert = { 
        ...feature,
        // Ensure we're sending correct types to the database
        title: feature.title,
        description: feature.description,
        icon_name: feature.icon_name
      };
      
      return supabase.from('features').insert(featureToInsert);
    },
    
    /**
     * Update a feature with proper typing
     */
    update: (feature: Partial<Feature>) => {
      // Ensure we have an ID for updates
      if (!feature.id) {
        throw new Error('ID is required for updating a feature');
      }
      
      const featureToUpdate = { ...feature };
      
      return supabase
        .from('features')
        .update(featureToUpdate)
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
