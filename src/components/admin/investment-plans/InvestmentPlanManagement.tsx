
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { InvestmentPlanForm } from "../InvestmentPlanForm";
import { InvestmentPlanList } from "./InvestmentPlanList";
import { Plus, RefreshCw } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";

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
      .channel('admin-products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log("Product change detected in InvestmentPlanManagement:", payload);
          fetchPlans();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("✅ InvestmentPlanManagement connected to Supabase realtime");
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching investment plans...");
      
      const plans = await adminUtils.getAdminPlans();
      
      if (plans && plans.length > 0) {
        console.log(`Found ${plans.length} investment plans`);
        const formattedPlans: Product[] = plans.map(plan => ({
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
      } else {
        console.log("No investment plans found");
        setPlans([]);
      }
    } catch (error: any) {
      console.error("Error fetching plans:", error);
      toast.error(error.message || "Failed to load investment plans");
      setPlans([]);
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

  const handleRefresh = () => {
    fetchPlans();
    toast.success("Investment plan data refreshed");
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Plan
          </Button>
        </div>
      </div>

      <InvestmentPlanList 
        plans={plans}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDeleteConfirm={openDeleteConfirm}
        onAddNew={() => setIsFormOpen(true)}
      />

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
