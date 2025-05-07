
import { useState } from "react";
import { Product } from "@/types";
import { InvestmentPlanCard } from "../InvestmentPlanCard";
import { AdminLoader } from "../shared/AdminLoader";
import { EmptyState } from "../shared/EmptyState";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestmentPlanListProps {
  plans: Product[];
  isLoading: boolean;
  onEdit: (plan: Product) => void;
  onDeleteConfirm: (id: string) => void;
  onAddNew: () => void;
}

export function InvestmentPlanList({
  plans,
  isLoading,
  onEdit,
  onDeleteConfirm,
  onAddNew,
}: InvestmentPlanListProps) {
  if (isLoading) {
    return <AdminLoader message="Loading investment plans..." />;
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<Plus className="h-6 w-6 text-muted-foreground" />}
        message="No investment plans found. Create your first plan to get started."
        actionButton={
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Plan
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <InvestmentPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onDelete={onDeleteConfirm}
        />
      ))}
    </div>
  );
}
