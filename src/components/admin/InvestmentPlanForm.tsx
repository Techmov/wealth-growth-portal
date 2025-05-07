
import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface InvestmentPlanFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvestmentPlanForm({ product, onSuccess, onCancel }: InvestmentPlanFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [amount, setAmount] = useState(product?.amount?.toString() || "");
  const [duration, setDuration] = useState(product?.duration?.toString() || "");
  const [growthRate, setGrowthRate] = useState(product?.growthRate?.toString() || "");
  const [risk, setRisk] = useState<"low" | "medium" | "high">(product?.risk || "medium");
  const [active, setActive] = useState(product?.active !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!product;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log(`${isEditing ? 'Updating' : 'Creating'} investment plan: ${name}`);
      
      const productData = {
        name,
        description,
        amount: parseFloat(amount),
        duration: parseInt(duration),
        growth_rate: parseFloat(growthRate),
        risk,
        active
      };

      let result;
      if (isEditing && product.id) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(isEditing ? "Investment plan updated successfully" : "Investment plan created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save investment plan");
      console.error("Error saving investment plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Investment Plan" : "Create Investment Plan"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium Growth Plan"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A high-growth investment plan with moderate risk..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="growthRate">Growth Rate (%)</Label>
              <Input
                id="growthRate"
                type="number"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                placeholder="5"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="risk">Risk Level</Label>
              <Select value={risk} onValueChange={(value) => setRisk(value as "low" | "medium" | "high")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="active" 
              checked={active}
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            <Label htmlFor="active">Active (visible to users)</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (isEditing ? "Update" : "Create")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
