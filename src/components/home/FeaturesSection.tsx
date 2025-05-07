
import { Feature } from "@/types/content";
import { FeatureCard } from "./FeatureCard";
import * as LucideIcons from "lucide-react";
import { AlertCircle, Star } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeaturesSectionProps {
  features: Feature[];
  isLoading: boolean;
  isAuthenticated?: boolean;
  useMockData?: boolean;
}

// Helper function to safely get icon component with proper typing
const getIconComponent = (iconName: string): LucideIcon => {
  if (iconName) {
    const selectedIcon = LucideIcons[iconName as keyof typeof LucideIcons];
    if (typeof selectedIcon === 'function') {
      return selectedIcon as LucideIcon;
    }
  }
  // Return Star as fallback icon
  return Star;
};

export function FeaturesSection({ features, isLoading, isAuthenticated = false, useMockData = false }: FeaturesSectionProps) {
  if (isLoading) {
    return (
      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-600 animate-pulse mx-auto mb-4"></div>
            <div className="h-6 bg-gray-600 rounded w-3/4 animate-pulse mx-auto"></div>
            <div className="h-4 bg-gray-600/70 rounded w-full animate-pulse mx-auto mt-4"></div>
            <div className="h-4 bg-gray-600/70 rounded w-5/6 animate-pulse mx-auto mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (features.length === 0) {
    return null;
  }

  // For authenticated users, we show a different layout
  if (isAuthenticated) {
    return (
      <div>
        {useMockData && (
          <div className="flex items-center justify-center mb-4 text-amber-600 text-sm">
            <AlertCircle size={16} className="mr-1" />
            <span>Showing example features</span>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComp = getIconComponent(feature.icon_name);
            
            return (
              <div key={feature.id} className="group">
                <div className="bg-gray-50 hover:bg-wealth-primary/5 border border-gray-200 rounded-lg p-6 text-center transition-all group-hover:border-wealth-primary">
                  <div className="w-16 h-16 bg-wealth-primary/10 text-wealth-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-wealth-primary group-hover:text-white transition-all">
                    <IconComp size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For non-authenticated users
  return (
    <div className="mt-16">
      {useMockData && (
        <div className="flex items-center justify-center mb-4 text-amber-600 text-sm">
          <AlertCircle size={16} className="mr-1" />
          <span>Showing example features</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}
