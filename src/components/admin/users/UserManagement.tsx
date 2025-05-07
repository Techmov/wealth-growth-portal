
import { useState, useEffect } from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminUtils } from "@/utils/adminUtils";
import { mapProfileToUser } from "@/utils/authMappers";
import { UsersList } from "./UsersList";
import { Button } from "@/components/ui/button";

export function UserManagement({ onUserDeleted }: { onUserDeleted?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription for profiles
    const channel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log("Profile change detected in UserManagement:", payload);
          fetchUsers();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("✅ UserManagement connected to Supabase realtime");
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all users...");
      
      // Try direct database query first
      let profiles = await adminUtils.getAllUsers();
      
      if (!profiles || profiles.length === 0) {
        // Fallback to direct query if RPC fails
        console.log("Fallback: Using direct query to fetch users");
        const { data, error } = await supabase.from('profiles').select('*');
        
        if (error) {
          throw error;
        }
        
        profiles = data;
      }
      
      if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} users`);
        const formattedUsers: User[] = profiles.map(profile => mapProfileToUser(profile));
        setUsers(formattedUsers);
      } else {
        console.log("No users found or could not access user data");
        setUsers([]);
        toast.error("No users found or permission denied");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete);
      
      if (error) {
        throw error;
      }
      
      // Remove user from local state
      setUsers(users.filter(user => user.id !== userToDelete));
      
      toast.success("User has been successfully deleted");
      
      if (onUserDeleted) {
        onUserDeleted();
      }
      
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    toast.success("User data refreshed");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <Button variant="outline" onClick={handleRefresh}>Refresh</Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <UsersList 
          users={filteredUsers} 
          isLoading={isLoading} 
          onDelete={handleDeleteUser} 
        />
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
