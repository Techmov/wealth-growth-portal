import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useInvestment } from "@/context/InvestmentContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface InvestmentCardProps {
  product: Product;
}

export function InvestmentCard({ product }: InvestmentCardProps) {
  const [isInvesting, setIsInvesting] = useState(false);
  const { invest, userInvestments } = useInvestment();
  const { user, updateUser } = useAuth();

  const handleInvest = async () => {
    if (!user) {
      toast.error("Please log in to invest");
      return;
    }

    if (product.amount > user.balance) {
      toast.error("Insufficient balance. Please deposit more funds.");
      return;
    }

    try {
      setIsInvesting(true);

      // Generate single timestamp for creation
      const creationDate = new Date().toISOString();
      const endDate = new Date(
        new Date(creationDate).getTime() + product.duration * 24 * 60 * 60 * 1000
      ).toISOString();

      // Initial values
      const startingValue = product.amount;
      const dailyGrowthRate = product.growthRate;
      const currentValue = startingValue; // Start with principal amount

      // Insert investment with synchronized timestamps
      const { error: insertError } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          product_id: product.id,
          amount: product.amount,
          start_date: creationDate,
          end_date: endDate,
          status: "active",
          starting_value: startingValue,
          final_value: startingValue * 2,
          current_value: currentValue,
          daily_growth_rate: dailyGrowthRate,
          last_profit_claim_date: creationDate, // Match creation date
          created_at: creationDate // Explicit set timestamp
        });

      if (insertError) {
        throw new Error(insertError.message || "Failed to create investment");
      }

      // Update user balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance, total_invested")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Failed to fetch user profile");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          balance: profile.balance - product.amount,
          total_invested: (profile.total_invested || 0) + product.amount
        })
        .eq("id", user.id);

      if (updateError) throw new Error("Balance update failed");
      if (updateUser) await updateUser();

      toast.success(`Successfully invested in ${product.name}!`);
    } catch (error: any) {
      console.error("Investment failed:", error);
      toast.error(error.message || "Investment failed. Please try again.");
    } finally {
      setIsInvesting(false);
    }
  };

  // Rest of the component remains the same...
  const calculateReturn = () => product.amount * 2;

  const riskColorMap = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const insufficientBalance = user && product.amount > user.balance;

  return (
    <Card className="overflow-hidden border-t-4 border-t-wealth-accent hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-1">
              {product.description}
            </CardDescription>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${riskColorMap[product.risk]}`}
          >
            {product.risk.charAt(0).toUpperCase() + product.risk.slice(1)} Risk
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration:</span>
          <span className="font-medium">{product.duration} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Investment Amount:</span>
          <span className="font-medium">${product.amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily Growth:</span>
          <span className="font-medium text-green-600">
            +{product.growthRate.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Return:</span>
          <span className="font-medium text-green-600">+100%</span>
        </div>

        <div className="pt-4 border-t">
          <div className="my-4 p-3 bg-muted/50 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">
              Projected Return
            </div>
            <div className="text-2xl font-bold">
              ${calculateReturn().toFixed(2)}
            </div>
          </div>
        </div>

        {insufficientBalance && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Insufficient balance. You need ${product.amount.toFixed(2)} to
              invest.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleInvest}
          disabled={isInvesting || insufficientBalance}
        >
          {isInvesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : insufficientBalance ? (
            "Deposit Funds"
          ) : (
            "Invest Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Calculate the current value including principal and growth
const getCurrentValue = (investment) => {
  if (
    investment.starting_value == null ||
    investment.daily_growth_rate == null ||
    investment.start_date == null
  ) return 0;

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
