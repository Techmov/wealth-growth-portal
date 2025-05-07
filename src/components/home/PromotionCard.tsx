
import { Link } from "react-router-dom";
import { Promotion } from "@/types/content";
import { Button } from "@/components/ui/button";

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100 transition-all hover:shadow-xl">
      {promotion.image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={promotion.image_url} 
            alt={promotion.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{promotion.title}</h3>
        <p className="text-gray-600 mb-4">{promotion.description}</p>
        
        {promotion.button_text && promotion.button_link && (
          <Link to={promotion.button_link}>
            <Button className="w-full">{promotion.button_text}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
