
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { InvestmentPlanForm } from "./InvestmentPlanForm";
import { InvestmentPlanCard } from "./InvestmentPlanCard";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvestmentPlanManagementProps {
  onStatusChange?: () => void;
}

export function InvestmentPlanManagement({ onStatusChange }: InvestmentPlanManagementProps) {
  const [plans, setPlans] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    
    // Set up real-time subscription for products
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        () => fetchPlans()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching investment plans...");
      
      const { data, error } = await supabase.rpc('get_admin_plans');

      if (error) {
        // Fallback to direct query if RPC fails
        const { data: directData, error: directError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) {
          throw directError;
        }
        
        if (directData) {
          console.log(`Found ${directData.length} investment plans`);
          const formattedPlans: Product[] = directData.map(plan => ({
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
      } else if (data) {
        console.log(`Found ${data.length} investment plans`);
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
      console.error("Error fetching plans:", error);
      toast.error(error.message || "Failed to load investment plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Product) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setPlanToDelete(id);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    
    try {
      console.log(`Deleting investment plan: ${planToDelete}`);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', planToDelete);

      if (error) {
        throw error;
      }

      setPlans(plans.filter(plan => plan.id !== planToDelete));
      toast.success("Investment plan deleted successfully");
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      setPlanToDelete(null);
    } catch (error: any) {
      console.error("Error deleting plan:", error);
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
        <h2 className="text-lg font-semibold">Investment Plans</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
            <p className="text-sm text-muted-foreground">Loading investment plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="border rounded-md flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No investment plans found. Create your first plan to get started.</p>
          <Button onClick={() => setIsFormOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add New Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <InvestmentPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={openDeleteConfirm}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This plan will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
