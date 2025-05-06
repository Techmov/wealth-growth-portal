
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DepositForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWaitingDialog, setShowWaitingDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Company TRC20 address
  const companyTrc20Address = "TMRKGbNjvhHnvK9p3LRtvACs7t6ttn3adN";

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle copy to clipboard
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(companyTrc20Address);
    toast.success("Address copied to clipboard");
  };

  // Timer effect for waiting window
  useEffect(() => {
    let timer;
    if (showWaitingDialog && timeLeft > 0 && !depositSuccess) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          setProgress(100 - ((newTime / 600) * 100));
          return newTime;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [showWaitingDialog, timeLeft, depositSuccess]);

  // Effect to check if time has run out
  useEffect(() => {
    if (timeLeft === 0 && !depositSuccess) {
      toast.error("Deposit confirmation time expired. Please try again or contact support.");
      setShowWaitingDialog(false);
      setTimeLeft(600); // Reset timer
    }
  }, [timeLeft, depositSuccess]);

  // Mock successful deposit (for demo purposes)
  const mockDepositConfirmation = () => {
    // Simulate random success between 30s and 2 minutes
    const randomTime = Math.floor(Math.random() * 90) + 30;
    
    setTimeout(() => {
      if (showWaitingDialog) {
        setDepositSuccess(true);
        toast.success("Your deposit has been confirmed!");
        
        // Close dialog after 3 seconds of showing success
        setTimeout(() => {
          setShowWaitingDialog(false);
          setAmount("");
          setTimeLeft(600);
          setProgress(0);
          setDepositSuccess(false);
        }, 3000);
      }
    }, randomTime * 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would create a deposit record here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show waiting dialog
      setShowWaitingDialog(true);
      
      // Start mock confirmation process (would be replaced by real admin confirmation)
      mockDepositConfirmation();
      
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast.error("Failed to process deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company USDT Deposit Address (TRC20)</h3>
          <div className="p-3 bg-muted rounded-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono break-all select-all">{companyTrc20Address}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopyAddress}
                className="ml-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            <p className="font-medium mb-2">Important Deposit Instructions:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Send only USDT (TRC20) to this address</li>
              <li>After sending, enter the amount below and click Submit</li>
              <li>Wait for admin confirmation (up to 10 minutes)</li>
            </ol>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Deposit Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="10"
            step="0.01"
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground">Minimum deposit: 10 USDT</p>
        </div>
        
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Deposit"
            )}
          </Button>
        </div>
      </form>

      {/* Waiting confirmation dialog */}
      <Dialog open={showWaitingDialog} onOpenChange={setShowWaitingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {!depositSuccess ? "Awaiting Deposit Confirmation" : "Deposit Confirmed!"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            {!depositSuccess ? (
              <>
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Waiting for admin confirmation</span>
                      <span className="font-mono">{formatTime(timeLeft)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-center h-20 w-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Please wait while an admin confirms your deposit.</p>
                    <p className="mt-1">This may take up to 10 minutes.</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-lg font-medium">Your deposit of ${amount} USDT has been confirmed!</p>
                <p className="text-center text-sm text-muted-foreground">
                  The funds have been added to your account.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
