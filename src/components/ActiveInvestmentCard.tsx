
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Investment, Product } from "@/types";
import { format } from "date-fns";
import { Loader2, Calendar, TrendingUp, BadgeDollarSign } from "lucide-react";
import { useUserInvestmentData } from "@/hooks/useUserInvestmentData";

interface ActiveInvestmentCardProps {
  investment: Investment;
  product?: Product;
}

export function ActiveInvestmentCard({ investment, product }: ActiveInvestmentCardProps) {
  const [isClaimingProfit, setIsClaimingProfit] = useState(false);
  const [claimableProfit, setClaimableProfit] = useState(0);
  const { updateInvestmentProfits } = useUserInvestmentData();

  const calculateDailyProfit = () => {
    if (!product) return 0;
    return investment.amount * (product.growthRate / 100);
  };

  const handleClaimProfit = async () => {
    try {
      setIsClaimingProfit(true);
      await updateInvestmentProfits(investment.id);
      setClaimableProfit(0);
    } catch (error) {
      console.error("Error claiming profit:", error);
    } finally {
      setIsClaimingProfit(false);
    }
  };

  const dailyProfit = calculateDailyProfit();

  const getCurrentValue = (investment: Investment) => {
    if (
      investment.starting_value == null ||
      investment.daily_growth_rate == null ||
      investment.start_date == null
    )
      return 0;

    const start = new Date(investment.start_date);
    const now = new Date();
    const daysElapsed = Math.max(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      1
    );
    const startingValue = Number(investment.starting_value);
    const dailyGrowthRate = Number(investment.daily_growth_rate);
    const finalValue = Number(investment.final_value);

    const totalValue =
      startingValue + (startingValue * dailyGrowthRate / 100 * daysElapsed);

    return Math.min(totalValue, finalValue);
  };

  const calculateProgress = () => {
    if (!investment.start_date || !investment.end_date) return 0;
    const startDate = new Date(investment.start_date);
    const endDate = new Date(investment.end_date);
    const currentDate = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();

    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getDaysLeft = () => {
    if (!investment.end_date) return 0;
    const endDate = new Date(investment.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/20 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product?.name || "Investment"}</CardTitle>
            <CardDescription>
              Invested on {format(new Date(investment.start_date), 'MMM d, yyyy')}
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
            <span className="font-medium">
              ${investment.starting_value != null ? Number(investment.starting_value).toFixed(2) : "0.00"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Profit:</span>
            <span className="font-medium text-green-600">+${dailyProfit.toFixed(2)}</span>
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

        <div className="space-y-2">
          <Progress value={calculateProgress()} />
          <div className="text-sm text-muted-foreground text-right">
            {getDaysLeft()} day{getDaysLeft() !== 1 ? 's' : ''} remaining
          </div>
        </div>

        <div className="flex justify-between text-sm border-t pt-3 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Maturity Date:</span>
          </div>
          <span className="font-medium">{format(new Date(investment.end_date), 'MMM d, yyyy')}</span>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>Expected Return:</span>
          </div>
          <span className="font-medium">
            ${investment.starting_value != null ? Number(investment.starting_value).toFixed(2) : "0.00"}
            <span>
              +{investment.daily_growth_rate != null ? Number(investment.daily_growth_rate).toFixed(2) : "0.00"}%
            </span>
          </span>
        </div>

        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span>
              {investment.start_date
                ? new Date(investment.start_date).toLocaleDateString('en-GB')
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date:</span>
            <span>
              {investment.end_date
                ? new Date(investment.end_date).toLocaleDateString('en-GB')
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Starting Amount:</span>
            <span>
              ${investment.starting_value != null
                ? Number(investment.starting_value).toFixed(2)
                : investment.amount != null
                ? Number(investment.amount).toFixed(2)
                : "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Value:</span>
            <span>
              {investment.starting_value != null && investment.daily_growth_rate != null && investment.start_date
                ? `$${getCurrentValue(investment).toFixed(2)}`
                : "$0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Daily Growth Rate:</span>
            <span>
              +{investment.daily_growth_rate != null
                ? Number(investment.daily_growth_rate).toFixed(2)
                : "0.00"}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span>{investment.status}</span>
          </div>
        </CardContent>
      </CardContent>
    </Card>
  );
}
