
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useInvestment } from "@/context/InvestmentContext";
import { useAuth } from "@/context/AuthContext";

interface InvestmentCardProps {
  product: Product;
}

export function InvestmentCard({ product }: InvestmentCardProps) {
  const [amount, setAmount] = useState<number>(product.minAmount);
  const [isInvesting, setIsInvesting] = useState(false);
  const { invest } = useInvestment();
  const { user } = useAuth();

  const handleInvest = async () => {
    try {
      setIsInvesting(true);
      await invest(product.id, amount);
    } finally {
      setIsInvesting(false);
    }
  };

  const calculateReturn = () => {
    return amount * 2;
  };

  const riskColorMap = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  };

  return (
    <Card className="overflow-hidden border-t-4 border-t-wealth-accent hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-1">{product.description}</CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${riskColorMap[product.risk]}`}>
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
          <span className="text-muted-foreground">Min Investment:</span>
          <span className="font-medium">${product.minAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily Growth:</span>
          <span className="font-medium text-green-600">+{product.growthRate.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Return:</span>
          <span className="font-medium text-green-600">+100%</span>
        </div>
        
        <div className="pt-4 border-t">
          <div className="mb-1 text-sm font-medium">Investment Amount</div>
          <Input
            type="number"
            min={product.minAmount}
            step={10}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={isInvesting}
          />
          
          <div className="my-4 p-3 bg-muted/50 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Projected Return</div>
            <div className="text-2xl font-bold">${calculateReturn().toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!user || isInvesting || (user && amount > user.balance)}
          onClick={handleInvest}
        >
          {isInvesting ? "Processing..." : "Invest Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
