
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Investment, Product } from "@/types";
import { useInvestment } from "@/context/InvestmentContext";
import { formatDistanceToNow, differenceInDays, format, addDays } from "date-fns";
import { Loader2, Calendar, TrendingUp, BadgeDollarSign } from "lucide-react";

interface ActiveInvestmentCardProps {
  investment: Investment;
  product?: Product;
}

export function ActiveInvestmentCard({ investment, product }: ActiveInvestmentCardProps) {
  const [isClaimingProfit, setIsClaimingProfit] = useState(false);
  const [claimableProfit, setClaimableProfit] = useState(0);
  const { claimProfit, getClaimableProfit } = useInvestment();

  // Calculate progress percentage
  const calculateProgress = () => {
    const today = new Date();
    const startDate = investment.startDate;
    const endDate = investment.endDate;
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(today, startDate);
    
    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    return Math.round(progress);
  };

  // Calculate days until maturity
  const daysUntilMaturity = () => {
    const today = new Date();
    const endDate = investment.endDate;
    return Math.max(0, differenceInDays(endDate, today));
  };

  // Calculate daily profit
  const calculateDailyProfit = () => {
    if (!product) return 0;
    return investment.amount * (product.growthRate / 100);
  };

  // Load claimable profit amount
  useEffect(() => {
    const loadClaimableProfit = async () => {
      const profit = await getClaimableProfit(investment.id);
      setClaimableProfit(profit);
    };
    
    loadClaimableProfit();
    
    // Set up a timer to refresh profit amount every minute
    const timer = setInterval(loadClaimableProfit, 60000);
    
    return () => clearInterval(timer);
  }, [investment.id, getClaimableProfit]);

  // Handle profit claim
  const handleClaimProfit = async () => {
    try {
      setIsClaimingProfit(true);
      await claimProfit(investment.id);
      setClaimableProfit(0); // Reset claimable profit amount after claiming
    } catch (error) {
      console.error("Error claiming profit:", error);
    } finally {
      setIsClaimingProfit(false);
    }
  };

  const progress = calculateProgress();
  const daysRemaining = daysUntilMaturity();
  const dailyProfit = calculateDailyProfit();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/20 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product?.name || "Investment"}</CardTitle>
            <CardDescription>
              Invested on {format(investment.startDate, 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Active
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invested Amount:</span>
            <span className="font-medium">${investment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Value:</span>
            <span className="font-medium">${investment.currentValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Profit:</span>
            <span className="font-medium text-green-600">+${dailyProfit.toFixed(2)}</span>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Started
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysRemaining} days left
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-muted/50 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Claimable Profit</div>
              <div className="text-xl font-bold text-green-600">${claimableProfit.toFixed(2)}</div>
            </div>
            <Button
              onClick={handleClaimProfit}
              size="sm"
              disabled={claimableProfit <= 0 || isClaimingProfit}
              className="bg-green-600 hover:bg-green-700"
            >
              {isClaimingProfit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <BadgeDollarSign className="mr-2 h-4 w-4" />
                  Claim Profit
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between text-sm border-t pt-3 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Maturity Date:</span>
          </div>
          <span className="font-medium">{format(investment.endDate, 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>Expected Return:</span>
          </div>
          <span className="font-medium">${investment.finalValue.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
