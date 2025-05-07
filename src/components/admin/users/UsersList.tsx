
import React from "react";
import { User } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { User as UserIcon } from "lucide-react";
import { AdminLoader } from "../shared/AdminLoader";
import { EmptyState } from "../shared/EmptyState";

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  onDelete: (userId: string) => void;
}

export function UsersList({ users, isLoading, onDelete }: UsersListProps) {
  if (isLoading) {
    return <AdminLoader message="Loading users..." />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<UserIcon className="h-6 w-6 text-muted-foreground" />}
        message="No users found"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Total Invested</TableHead>
          <TableHead>Total Withdrawn</TableHead>
          <TableHead>Referral Bonus</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.username}</TableCell>
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
                  onClick={() => onDelete(user.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
