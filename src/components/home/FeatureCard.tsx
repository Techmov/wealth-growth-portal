
import { Feature } from "@/types/content";
import * as LucideIcons from "lucide-react";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

export function FeatureCard({ feature, className = "" }: FeatureCardProps) {
  // Dynamic icon component selection
  const IconComponent = (LucideIcons as any)[feature.icon_name] || LucideIcons.Star;
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm p-6 rounded-lg ${className}`}>
      <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center mx-auto mb-4">
        <IconComponent size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
      <p className="text-white/70">{feature.description}</p>
    </div>
  );
}
