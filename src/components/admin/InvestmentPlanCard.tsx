
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types";
import { Edit, Trash2 } from "lucide-react";

interface InvestmentPlanCardProps {
  plan: Product;
  onEdit: (plan: Product) => void;
  onDelete: (id: string) => void;
}

export function InvestmentPlanCard({ plan, onEdit, onDelete }: InvestmentPlanCardProps) {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card key={plan.id} className={!plan.active ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(plan)} title="Edit plan">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(plan.id)} 
              title="Delete plan"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {plan.description}
          </p>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Amount:</span>
            <span>${plan.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Duration:</span>
            <span>{plan.duration} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Growth Rate:</span>
            <span>{plan.growthRate}%</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="font-medium">Risk:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getRiskBadgeColor(plan.risk)}`}>
              {plan.risk.charAt(0).toUpperCase() + plan.risk.slice(1)}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="font-medium">Status:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {plan.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
