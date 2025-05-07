
import { Promotion } from "@/types/content";
import { PromotionCard } from "./PromotionCard";

interface PromotionsSectionProps {
  promotions: Promotion[];
  isLoading: boolean;
}

export function PromotionsSection({ promotions, isLoading }: PromotionsSectionProps) {
  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow border border-gray-100">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse mt-2"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Special Promotions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take advantage of these limited-time opportunities to maximize your investment potential.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </div>
    </div>
  );
}
