
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
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

interface UserManagementProps {
  onUserDeleted?: () => void;
}

export function UserManagement({ onUserDeleted }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Load users function to be called whenever needed
  const loadUsers = () => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);
      console.log("Loaded users:", parsedUsers);
    } else {
      const mockUsers: User[] = [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          balance: 2500,
          totalInvested: 5000,
          totalWithdrawn: 1000,
          referralBonus: 200,
          referralCode: "JD1234",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
          role: "user"
        },
        {
          id: "user-2",
          name: "Jane Smith",
          email: "jane@example.com",
          balance: 4200,
          totalInvested: 8000,
          totalWithdrawn: 2000,
          referralBonus: 450,
          referralCode: "JS5678",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
          role: "user"
        },
        {
          id: "user-3",
          name: "Bob Johnson",
          email: "bob@example.com",
          balance: 1800,
          totalInvested: 3000,
          totalWithdrawn: 800,
          referralBonus: 150,
          referralCode: "BJ9012",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          role: "user"
        }
      ];
      
      setUsers(mockUsers);
      localStorage.setItem("users", JSON.stringify(mockUsers));
    }
  };

  useEffect(() => {
    // Initial load
    loadUsers();

    // Listen for user signup events to update the list in real-time
    const handleUserSignup = () => {
      loadUsers(); // Reload all users when a new signup happens
    };

    window.addEventListener("userSignup", handleUserSignup);
    
    return () => {
      window.removeEventListener("userSignup", handleUserSignup);
    };
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(user => user.id !== userToDelete);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Update admin stats in localStorage
      const currentStats = JSON.parse(localStorage.getItem("adminStats") || "{}");
      const newStats = {
        ...currentStats,
        totalUsers: (currentStats.totalUsers || updatedUsers.length + 1) - 1
      };
      localStorage.setItem("adminStats", JSON.stringify(newStats));
      
      // Dispatch custom event to notify other components of the change
      const event = new CustomEvent("userDeleted", { detail: { userId: userToDelete } });
      window.dispatchEvent(event);
      
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
      
      if (onUserDeleted) {
        onUserDeleted();
      }
      
      setUserToDelete(null);
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
        <Button onClick={loadUsers} variant="outline">Refresh</Button>
      </div>
      
      <div className="border rounded-md">
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.balance?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>${user.totalInvested?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>${user.totalWithdrawn?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>${user.referralBonus?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    {user.createdAt ? 
                      formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 
                      "Unknown"}
                  </TableCell>
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
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
