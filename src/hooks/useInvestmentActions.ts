
import { User } from "@/types";
import { useInvestFunction } from "./investment/useInvestFunction";
import { useClaimProfitFunction } from "./investment/useClaimProfitFunction";
import { useReferralFunction } from "./investment/useReferralFunction";

export function useInvestmentActions(user: User | null) {
  const { invest } = useInvestFunction(user);
  const { claimProfit, getClaimableProfit } = useClaimProfitFunction(user);
  const { getReferralBonus, getUserDownlines } = useReferralFunction(user);

  return {
    invest,
    claimProfit,
    getClaimableProfit,
    getReferralBonus,
    getUserDownlines,
  };
}
