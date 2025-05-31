
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface WithdrawalButtonProps {
  isProcessing: boolean;
  isValidAmount: boolean;
  hasRequiredSetup: boolean;
  hasSufficientFunds: boolean;
  onSubmit: () => void;
}

export function WithdrawalButton({
  isProcessing,
  isValidAmount,
  hasRequiredSetup,
  hasSufficientFunds,
  onSubmit
}: WithdrawalButtonProps) {
  const getButtonState = () => {
    if (isProcessing) {
      return {
        text: "Processing...",
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
        disabled: true,
        variant: "default" as const
      };
    }
    
    if (!hasRequiredSetup) {
      return {
        text: "Complete Setup Required",
        icon: <AlertCircle className="mr-2 h-4 w-4" />,
        disabled: true,
        variant: "outline" as const
      };
    }
    
    if (!isValidAmount) {
      return {
        text: "Enter Valid Amount",
        icon: <AlertCircle className="mr-2 h-4 w-4" />,
        disabled: true,
        variant: "outline" as const
      };
    }
    
    if (!hasSufficientFunds) {
      return {
        text: "Insufficient Funds",
        icon: <AlertCircle className="mr-2 h-4 w-4" />,
        disabled: true,
        variant: "destructive" as const
      };
    }
    
    return {
      text: "Request Withdrawal",
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      disabled: false,
      variant: "default" as const
    };
  };

  const buttonState = getButtonState();

  return (
    <Button 
      type="submit" 
      className="w-full" 
      variant={buttonState.variant}
      disabled={buttonState.disabled}
      onClick={onSubmit}
    >
      {buttonState.icon}
      {buttonState.text}
    </Button>
  );
}
