import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { Transaction } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { ResponsivePagination } from "@/components/ResponsivePagination";

export function TransactionsList() {
  const { user } = useAuth();
  const { transactions } = useInvestment();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    // Set loading to false when transactions are loaded
    if (transactions) {
      setIsLoading(false);
    }
  }, [transactions]);

  // Ensure pagination works correctly
  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Function to get appropriate badge color based on transaction status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-500 hover:bg-green-600";
      case 'pending':
        return "bg-yellow-500 hover:bg-yellow-600";
      case 'failed':
      case 'rejected':
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Function to format transaction type for display
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Transactions</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatTransactionType(transaction.type)}</TableCell>
                    <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} USDT
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {transactions.length > itemsPerPage && (
            <ResponsivePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
