
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Downline } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { UserPlus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "./ui/pagination";

interface DownlinesListProps {
  downlines: Downline[];
  isLoading?: boolean;
}

export function DownlinesList({ downlines, isLoading = false }: DownlinesListProps) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalPages = Math.max(1, Math.ceil(downlines.length / itemsPerPage));
  const paginatedDownlines = downlines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Loading Downlines...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!downlines || downlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Your Downlines
          </CardTitle>
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

  // Find max invested amount for relative progress bars
  const maxInvested = Math.max(...downlines.map(d => d.totalInvested));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Your Downlines ({downlines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile view - card based
          <div className="space-y-4">
            {paginatedDownlines.map((downline) => (
              <Card key={downline.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{downline.username}</div>
                    <Badge variant="outline">
                      {formatDistanceToNow(new Date(downline.date), { addSuffix: true })}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm text-muted-foreground">Invested:</div>
                      <div className="text-right font-medium">${downline.totalInvested.toFixed(2)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-sm text-muted-foreground">Your Bonus:</div>
                      <div className="text-right font-medium text-green-600">${downline.bonusGenerated.toFixed(2)}</div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Investment Level</span>
                        <span className="flex items-center text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {Math.round((downline.totalInvested / maxInvested) * 100) || 0}%
                        </span>
                      </div>
                      <Progress value={(downline.totalInvested / maxInvested) * 100 || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop view - table based
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Total Invested</TableHead>
                <TableHead>Your Bonus</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDownlines.map((downline) => (
                <TableRow key={downline.id}>
                  <TableCell className="font-medium">{downline.username}</TableCell>
                  <TableCell>${downline.totalInvested.toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">${downline.bonusGenerated.toFixed(2)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(downline.date), { addSuffix: true })}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={(downline.totalInvested / maxInvested) * 100 || 0} className="h-2" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {Math.round((downline.totalInvested / maxInvested) * 100) || 0}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
