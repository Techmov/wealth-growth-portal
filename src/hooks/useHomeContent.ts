
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Offer, Feature } from "@/types/content";
import { formatDates } from "@/utils/dbTypes";

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
        
        // Format dates for all data if needed
        const formattedPromotions = promotionsData || [];
        const formattedOffers = offersData || [];
        const formattedFeatures = featuresData || [];
        
        setPromotions(formattedPromotions as Promotion[]);
        setOffers(formattedOffers as Offer[]);
        setFeatures(formattedFeatures as Feature[]);
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
