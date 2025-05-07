
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Offer, Feature } from "@/types/content";
import { formatDates } from "@/utils/dbTypes";

// Mock data for when no database content is available
const mockPromotions: Promotion[] = [
  {
    id: "mock-promo-1",
    title: "New Year Special Investment",
    description: "Start your investment journey with our special promotion for new investors. Get exclusive benefits and higher returns.",
    image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80",
    button_text: "Learn More",
    button_link: "/investments",
    is_active: true,
    priority: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-promo-2",
    title: "Referral Rewards Program",
    description: "Invite friends to our platform and earn up to 5% bonus on their initial investments. The more you refer, the more you earn!",
    image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    button_text: "Start Referring",
    button_link: "/referrals",
    is_active: true,
    priority: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockOffers: Offer[] = [
  {
    id: "mock-offer-1",
    title: "Premium Plan Discount",
    description: "Get 10% off on our premium investment plan when you upgrade this month.",
    discount_percentage: 10,
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    is_active: true,
    priority: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-offer-2",
    title: "Early Investor Bonus",
    description: "First 100 investors get a 5% bonus added to their initial investment.",
    discount_percentage: 5,
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1115&q=80",
    is_active: true,
    priority: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-offer-3",
    title: "Long-term Investment Deal",
    description: "Extra 3% returns on investments held for more than 12 months.",
    discount_percentage: 3,
    start_date: new Date().toISOString(),
    end_date: null,
    image_url: "https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    is_active: true,
    priority: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockFeatures: Feature[] = [
  {
    id: "mock-feature-1",
    title: "24/7 Support",
    description: "Our team is available around the clock to assist you with any questions or concerns.",
    icon_name: "Headphones",
    is_active: true,
    priority: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-feature-2",
    title: "Secure Investments",
    description: "Advanced security protocols ensure your investments and personal data remain protected.",
    icon_name: "Shield",
    is_active: true,
    priority: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-feature-3",
    title: "Real-time Analytics",
    description: "Track your investment performance with comprehensive real-time analytics and reports.",
    icon_name: "BarChart2",
    is_active: true,
    priority: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-feature-4",
    title: "Quick Withdrawals",
    description: "Access your funds with our streamlined withdrawal process within 24-48 hours.",
    icon_name: "CreditCard",
    is_active: true,
    priority: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useHomeContent = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

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
        
        // Format data with proper typing
        // Use as Promotion[] to tell TypeScript these objects match our interface
        const formattedPromotions = (promotionsData || []).map(promo => formatDates(promo)) as Promotion[];
        const formattedOffers = (offersData || []).map(offer => formatDates(offer)) as Offer[];
        const formattedFeatures = (featuresData || []).map(feature => formatDates(feature)) as Feature[];
        
        // If we don't have data from the database, use mock data
        const usePromotionsMock = formattedPromotions.length === 0;
        const useOffersMock = formattedOffers.length === 0;
        const useFeaturesMock = formattedFeatures.length === 0;

        // Set flag if we're using any mock data
        setUseMockData(usePromotionsMock || useOffersMock || useFeaturesMock);
        
        // Set data, using mock data if necessary
        setPromotions(usePromotionsMock ? mockPromotions : formattedPromotions);
        setOffers(useOffersMock ? mockOffers : formattedOffers);
        setFeatures(useFeaturesMock ? mockFeatures : formattedFeatures);
      } catch (err: any) {
        console.error("Error fetching home content:", err);
        setError(err.message);
        
        // Use mock data in case of error
        setUseMockData(true);
        setPromotions(mockPromotions);
        setOffers(mockOffers);
        setFeatures(mockFeatures);
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

  return { promotions, offers, features, isLoading, error, useMockData };
};
