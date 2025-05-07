
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Offer, Feature } from "@/types/content";

export const useHomeContent = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch promotions
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (promotionsError) {
          throw new Error(`Error fetching promotions: ${promotionsError.message}`);
        }
        
        // Fetch offers
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (offersError) {
          throw new Error(`Error fetching offers: ${offersError.message}`);
        }
        
        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('features')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (featuresError) {
          throw new Error(`Error fetching features: ${featuresError.message}`);
        }
        
        // Format dates for offers
        const formattedOffers = offersData.map(offer => ({
          ...offer,
          start_date: offer.start_date ? new Date(offer.start_date) : undefined,
          end_date: offer.end_date ? new Date(offer.end_date) : undefined,
          created_at: offer.created_at ? new Date(offer.created_at) : undefined,
          updated_at: offer.updated_at ? new Date(offer.updated_at) : undefined
        }));

        // Format dates for promotions
        const formattedPromotions = promotionsData.map(promo => ({
          ...promo,
          created_at: promo.created_at ? new Date(promo.created_at) : undefined,
          updated_at: promo.updated_at ? new Date(promo.updated_at) : undefined
        }));

        // Format dates for features
        const formattedFeatures = featuresData.map(feature => ({
          ...feature,
          created_at: feature.created_at ? new Date(feature.created_at) : undefined,
          updated_at: feature.updated_at ? new Date(feature.updated_at) : undefined
        }));
        
        setPromotions(formattedPromotions);
        setOffers(formattedOffers);
        setFeatures(formattedFeatures);
      } catch (err: any) {
        console.error("Error fetching home content:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('home-content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => fetchContent()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'offers' },
        () => fetchContent()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'features' },
        () => fetchContent()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { promotions, offers, features, isLoading, error };
};
