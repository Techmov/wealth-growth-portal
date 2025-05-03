
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Downline } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DownlinesListProps {
  downlines: Downline[];
}

export function DownlinesList({ downlines }: DownlinesListProps) {
  if (downlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Downlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">You don't have any downlines yet.</p>
            <p className="text-muted-foreground mt-1">Share your referral link to start earning bonuses!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Downlines</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Total Invested</TableHead>
              <TableHead>Bonus Earned</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downlines.map((downline) => (
              <TableRow key={downline.id}>
                <TableCell className="font-medium">{downline.username}</TableCell>
                <TableCell>${downline.totalInvested.toFixed(2)}</TableCell>
                <TableCell className="text-green-600">${downline.bonusGenerated.toFixed(2)}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(downline.date), { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
