
import { useState } from "react";
import { toast } from "sonner";
import { Promotion } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PromoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
  onSuccess: () => void;
}

export function PromoFormDialog({ 
  open, 
  onOpenChange, 
  promotion, 
  onSuccess 
}: PromoFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Promotion>>(
    promotion || {
      title: "",
      description: "",
      image_url: "",
      button_text: "",
      button_link: "",
      is_active: true,
      priority: 0
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      
      if (promotion?.id) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update({
            ...formData,
            updated_at: now
          })
          .eq('id', promotion.id) as { error: any };
        
        if (error) throw error;
        toast.success("Promotion updated successfully");
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('promotions')
          .insert({
            ...formData,
            created_at: now,
            updated_at: now
          }) as { error: any };
        
        if (error) throw error;
        toast.success("Promotion created successfully");
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(`Error saving promotion: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {promotion ? "Edit Promotion" : "Add New Promotion"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Promotion title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter promotion details"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Button Text</Label>
              <Input
                id="button_text"
                name="button_text"
                value={formData.button_text || ""}
                onChange={handleChange}
                placeholder="e.g., Learn More"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button_link">Button Link</Label>
              <Input
                id="button_link"
                name="button_link"
                value={formData.button_link || ""}
                onChange={handleChange}
                placeholder="e.g., /signup"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url || ""}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (Higher appears first)</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                value={formData.priority || 0}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2 h-full pt-6">
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active || false}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : promotion ? "Update Promotion" : "Create Promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
