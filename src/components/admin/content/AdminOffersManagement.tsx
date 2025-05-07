
import { useState } from "react";
import { OfferFormDialog } from "./OfferFormDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Offer } from "@/types/content";
import { Loader2, Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/utils/dbTypes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistance } from "date-fns";

export function AdminOffersManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offers data
  const { data: offers, isLoading, error, isError } = useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: async () => {
      const { data, error } = await db.offers.select();
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  // Toggle offer active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const { error } = await db.offers.update({
        id,
        title: offers?.find(o => o.id === id)?.title || "",
        description: offers?.find(o => o.id === id)?.description || "",
        is_active: isActive
      });
      if (error) throw new Error(error.message);
      return { id, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
      toast({
        title: "Status Updated",
        description: `Offer has been ${data.isActive ? 'activated' : 'deactivated'}.`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update offer status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete offer mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.offers.delete(id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
      toast({
        title: "Offer Deleted",
        description: "The offer has been successfully deleted.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete offer: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateOffer = () => {
    setCurrentOffer(null);
    setShowCreateDialog(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setCurrentOffer(offer);
    setShowCreateDialog(true);
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDialogClose = (refreshData: boolean) => {
    setShowCreateDialog(false);
    if (refreshData) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Special Offers</CardTitle>
          <CardDescription>Manage special offers and discounts shown to users on the website.</CardDescription>
        </div>
        <Button onClick={handleCreateOffer}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Offer
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p>Error loading offers: {error?.toString()}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'offers'] })}
            >
              Try Again
            </Button>
          </div>
        ) : !offers?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No offers found. Click the "Add New Offer" button to create one.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => {
                const hasEnded = offer.end_date && new Date(offer.end_date) < new Date();
                const isExpiringSoon = offer.end_date && 
                  new Date(offer.end_date) > new Date() && 
                  new Date(offer.end_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;
                
                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="font-medium">{offer.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{offer.description}</div>
                    </TableCell>
                    <TableCell>
                      {offer.discount_percentage ? `${offer.discount_percentage}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {offer.start_date && (
                        <div className="text-xs">
                          From: {new Date(offer.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {offer.end_date && (
                        <div className={`text-xs ${hasEnded ? 'text-destructive' : isExpiringSoon ? 'text-amber-600' : ''}`}>
                          {hasEnded ? 'Ended: ' : isExpiringSoon ? 'Ending soon: ' : 'Until: '}
                          {new Date(offer.end_date).toLocaleDateString()}
                        </div>
                      )}
                      {!offer.start_date && !offer.end_date && <span className="text-xs">No date limits</span>}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        offer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    <TableCell>{offer.priority}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleToggleActive(offer.id, offer.is_active)}
                          title={offer.is_active ? "Deactivate" : "Activate"}
                        >
                          {offer.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditOffer(offer)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteOffer(offer.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {showCreateDialog && (
          <OfferFormDialog 
            open={showCreateDialog} 
            onClose={handleDialogClose} 
            offer={currentOffer} 
          />
        )}
      </CardContent>
    </Card>
  );
}
