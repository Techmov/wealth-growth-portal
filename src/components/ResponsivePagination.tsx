
import { useState } from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ResponsivePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ResponsivePaginationProps) => {
  const isMobile = useIsMobile();
  
  // No pagination needed for single page
  if (totalPages <= 1) return null;
  
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = isMobile ? 3 : 5;
    
    // Simple case for few pages
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Complex case with ellipsis
    if (currentPage <= 3) {
      // Near start
      for (let i = 1; i <= Math.min(4, totalPages); i++) {
        pageNumbers.push(i);
      }
      if (totalPages > 4) pageNumbers.push(-1); // Ellipsis
      if (totalPages > 4) pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near end
      pageNumbers.push(1);
      pageNumbers.push(-1); // Ellipsis
      for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Middle
      pageNumbers.push(1);
      pageNumbers.push(-1); // Ellipsis
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push(-2); // Ellipsis
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
          />
        </PaginationItem>
        
        {getPageNumbers().map((pageNum, index) => (
          <PaginationItem key={index}>
            {pageNum === -1 || pageNum === -2 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={currentPage === pageNum}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
