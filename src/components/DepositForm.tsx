
import { useState, useRef, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CreditCard, Info, ArrowUp, Copy, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";

export function DepositForm() {
  const { user, deposit } = useAuth();
  const { platformTrc20Address } = useInvestment();
  
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);

  if (!user || !platformTrc20Address) {
    return null;
  }

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (depositAmount < 10) {
      toast.error("Minimum deposit amount is 10 USDT");
      return;
    }
    
    if (!txHash.trim()) {
      toast.error("Please enter your transaction hash");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await deposit(depositAmount, txHash);
      setAmount("");
      setTxHash("");
      toast.success("Deposit request submitted successfully", {
        description: "An admin will verify and process your deposit within 24 hours"
      });
    } catch (error: any) {
      toast.error("Deposit failed", {
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && platformTrc20Address) {
      navigator.clipboard.writeText(platformTrc20Address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine if button should be disabled
  const isButtonDisabled = isProcessing || 
    !amount || 
    parseFloat(amount) <= 0 || 
    !txHash.trim();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Make a Deposit</h3>
          <p className="text-sm text-muted-foreground">Add funds to your investment account</p>
        </div>

        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <span>
                Send USDT (TRC20) to our address below, then enter the transaction details.
              </span>
            </div>
            <div className="mt-2 p-3 bg-blue-100 rounded-md relative">
              <div ref={addressRef} className="font-mono text-sm break-all pr-10">
                {platformTrc20Address}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={copyToClipboard}
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Sent (USDT)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="10"
                step="10"
                placeholder="100"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum deposit amount: $10
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="txHash">Transaction Hash</Label>
            <Input
              id="txHash"
              placeholder="Enter your transaction hash"
              className="font-mono text-sm"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This helps us verify your deposit on the blockchain
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isButtonDisabled}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Submit Deposit"}
            </Button>
          </div>
        </form>
        
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm font-medium">Deposit Information</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Deposits are confirmed manually within 24 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Only send USDT using the TRC20 network</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span>Contact support if your deposit isn't credited after 24 hours</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
