import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Promotion } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Plus, Pencil, Trash2 } from "lucide-react";
import { PromoFormDialog } from "./PromoFormDialog";

export function AdminPromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-promos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => fetchPromotions()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Cast the data to the correct type
      const formattedPromotions = (data || []) as Promotion[];
      
      setPromotions(formattedPromotions);
    } catch (error: any) {
      toast.error(`Error fetching promotions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedPromotion(null);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Promotion ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      
      // Update local state without refetching
      setPromotions(promotions.map(promo => 
        promo.id === id ? { ...promo, is_active: !currentStatus } : promo
      ));
    } catch (error: any) {
      toast.error(`Error updating promotion: ${error.message}`);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setPromoToDelete(id);
  };

  const handleDelete = async () => {
    if (!promoToDelete) return;
    
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promoToDelete);
      
      if (error) {
        throw error;
      }
      
      toast.success("Promotion deleted successfully");
      setPromoToDelete(null);
      
      // Update local state
      setPromotions(promotions.filter(promo => promo.id !== promoToDelete));
    } catch (error: any) {
      toast.error(`Error deleting promotion: ${error.message}`);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPromotion(null);
    fetchPromotions();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manage Promotions</h2>
        <Button onClick={() => {
          setSelectedPromotion(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Promotion
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-muted-foreground mb-4">No promotions found. Create your first promotion to showcase on the homepage.</p>
            <Button onClick={() => {
              setSelectedPromotion(null);
              setIsFormOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Promotion
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Button</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map(promo => (
                <TableRow key={promo.id} className={promo.is_active ? '' : 'opacity-50'}>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{promo.description}</TableCell>
                  <TableCell>{promo.button_text || '-'}</TableCell>
                  <TableCell>{promo.priority}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleActive(promo.id, promo.is_active)}
                      title={promo.is_active ? "Deactivate" : "Activate"}
                    >
                      {promo.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(promo)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteConfirm(promo.id)}
                      title="Delete"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!promoToDelete} onOpenChange={(open) => !open && setPromoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This promotion will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (promoToDelete) {
                supabase
                  .from('promotions')
                  .delete()
                  .eq('id', promoToDelete)
                  .then(({ error }) => {
                    if (error) {
                      toast.error(`Error deleting promotion: ${error.message}`);
                    } else {
                      toast.success("Promotion deleted successfully");
                      setPromotions(promotions.filter(promo => promo.id !== promoToDelete));
                    }
                    setPromoToDelete(null);
                  });
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <PromoFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        promotion={selectedPromotion}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedPromotion(null);
          fetchPromotions();
        }}
      />
    </div>
  );
}
