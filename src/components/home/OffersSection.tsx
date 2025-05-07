
import { Offer } from "@/types/content";
import { OfferCard } from "./OfferCard";

interface OffersSectionProps {
  offers: Offer[];
  isLoading: boolean;
}

export function OffersSection({ offers, isLoading }: OffersSectionProps) {
  if (isLoading) {
    return (
      <div className="py-12 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                <div className="h-32 bg-gray-200 animate-pulse"></div>
                <div className="p-5">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Special Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Limited-time investment opportunities with exclusive terms and benefits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </div>
  );
}
