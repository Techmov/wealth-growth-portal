
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestmentPlanForm } from "./InvestmentPlanForm";
import { Edit, Plus, Trash2 } from "lucide-react";

interface InvestmentPlanManagementProps {
  onStatusChange?: () => void;
}

export function InvestmentPlanManagement({ onStatusChange }: InvestmentPlanManagementProps) {
  const [plans, setPlans] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedPlans: Product[] = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          amount: plan.amount,
          duration: plan.duration,
          growthRate: plan.growth_rate,
          risk: plan.risk as 'low' | 'medium' | 'high',
          active: plan.active
        }));
        setPlans(formattedPlans);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load investment plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Product) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment plan? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPlans(plans.filter(plan => plan.id !== id));
      toast.success("Investment plan deleted successfully");
      if (onStatusChange) onStatusChange();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete investment plan");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPlan(null);
    fetchPlans();
    if (onStatusChange) onStatusChange();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedPlan(null);
  };

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

  if (isFormOpen) {
    return (
      <InvestmentPlanForm 
        product={selectedPlan || undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Investment Plans</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading investment plans...</div>
      ) : plans.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          No investment plans found. Create your first plan to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card key={plan.id} className={!plan.active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
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
          ))}
        </div>
      )}
    </div>
  );
}
