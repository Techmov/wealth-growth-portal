
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";
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

export function UserManagement() {
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
        () => fetchUsers()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        throw error;
      }

      if (data) {
        const formattedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          username: profile.username,
          balance: profile.balance,
          totalInvested: profile.total_invested,
          totalWithdrawn: profile.total_withdrawn,
          referralBonus: profile.referral_bonus,
          referralCode: profile.referral_code,
          trc20Address: profile.trc20_address || '',
          withdrawalPassword: profile.withdrawal_password || '',
          role: profile.role === 'admin' ? 'admin' : 'user',
          createdAt: new Date(profile.created_at || Date.now())
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Total Withdrawn</TableHead>
                <TableHead>Referral Bonus</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>${user.balance.toFixed(2)}</TableCell>
                    <TableCell>${user.totalInvested.toFixed(2)}</TableCell>
                    <TableCell>${user.totalWithdrawn.toFixed(2)}</TableCell>
                    <TableCell>${user.referralBonus.toFixed(2)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
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
