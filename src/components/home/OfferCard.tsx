
import { Offer } from "@/types/content";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const hasEnded = offer.end_date && new Date(offer.end_date) < new Date();
  const isExpiringSoon = offer.end_date && 
    new Date(offer.end_date) > new Date() && 
    new Date(offer.end_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days
  
  return (
    <div className={`rounded-lg overflow-hidden border transition-all ${hasEnded ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-wealth-primary/30 bg-wealth-primary/5 shadow-md hover:shadow-lg'}`}>
      {offer.image_url && (
        <div className="h-32 overflow-hidden">
          <img 
            src={offer.image_url} 
            alt={offer.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{offer.title}</h3>
          {offer.discount_percentage && (
            <Badge className="bg-wealth-primary">{offer.discount_percentage}% OFF</Badge>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
        
        {offer.end_date && !hasEnded && (
          <div className={`text-xs mt-2 ${isExpiringSoon ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {isExpiringSoon ? '⚠️ ' : ''}
            Ends {formatDistance(new Date(offer.end_date), new Date(), { addSuffix: true })}
          </div>
        )}
        
        {hasEnded && (
          <div className="text-xs mt-2 text-gray-500">
            Offer has ended
          </div>
        )}
      </div>
    </div>
  );
}
