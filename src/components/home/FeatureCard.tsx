
import { Feature } from "@/types/content";
import * as LucideIcons from "lucide-react";
import { Star } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

export function FeatureCard({ feature, className = "" }: FeatureCardProps) {
  // Safe icon component selection with proper typing
  let IconComponent: LucideIcon = Star; // Default fallback
  
  if (feature.icon_name) {
    const selectedIcon = LucideIcons[feature.icon_name as keyof typeof LucideIcons];
    if (typeof selectedIcon === 'function') {
      IconComponent = selectedIcon as LucideIcon;
    }
  }
  
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
