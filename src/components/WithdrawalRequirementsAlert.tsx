
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WithdrawalRequirementsAlertProps {
  hasTrc20Address: boolean;
  hasWithdrawalPassword: boolean;
}

export function WithdrawalRequirementsAlert({ 
  hasTrc20Address, 
  hasWithdrawalPassword 
}: WithdrawalRequirementsAlertProps) {
  const navigate = useNavigate();
  
  const missingRequirements = [];
  if (!hasTrc20Address) missingRequirements.push("TRC20 address");
  if (!hasWithdrawalPassword) missingRequirements.push("withdrawal password");
  
  if (missingRequirements.length === 0) return null;

  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Complete setup required to withdraw funds
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            You need to set up the following before you can withdraw:
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
            {!hasTrc20Address && (
              <li className="flex items-center gap-2">
                <Wallet className="h-3 w-3" />
                TRC20 withdrawal address
              </li>
            )}
            {!hasWithdrawalPassword && (
              <li className="flex items-center gap-2">
                <Key className="h-3 w-3" />
                Withdrawal password (optional but recommended)
              </li>
            )}
          </ul>
        </div>
        <Button 
          size="sm" 
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => navigate("/profile")}
        >
          Complete Setup in Profile
        </Button>
      </AlertDescription>
    </Alert>
  );
}
