
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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real app, fetch users from backend
    // For now, we'll use mock data
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
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {filteredUsers.map((user) => (
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
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
