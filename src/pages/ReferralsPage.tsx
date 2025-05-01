
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { toast } from "@/components/ui/sonner";

const ReferralsPage = () => {
  const { user } = useAuth();
  const { getReferralBonus } = useInvestment();
  const [referralCode, setReferralCode] = useState("");
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied to clipboard");
  };

  const handleClaimBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode) return;
    
    try {
      setIsClaimingBonus(true);
      await getReferralBonus(referralCode);
      setReferralCode("");
    } finally {
      setIsClaimingBonus(false);
    }
  };

  // Generate referral link
  const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-muted-foreground">
            Earn bonus rewards by inviting friends to join WealthGrow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with friends to earn bonuses when they sign up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="font-mono text-sm break-all">{referralLink}</p>
              </div>
              <Button onClick={copyReferralCode} className="w-full">
                Copy Referral Link
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-center font-medium mb-2">Or share your referral code</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-primary/10 px-3 py-1 rounded font-mono font-medium">
                    {user.referralCode}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyReferralCode}>
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral Rewards</CardTitle>
              <CardDescription>
                Earn $50 for each friend who signs up and makes an investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">${user.referralBonus.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                  $
                </div>
              </div>
              
              <div className="border-t pt-4">
                <form onSubmit={handleClaimBonus} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claim-code">Claim a Referral Bonus</Label>
                    <Input
                      id="claim-code"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!referralCode || isClaimingBonus}
                  >
                    {isClaimingBonus ? "Claiming..." : "Claim Bonus"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Enter a valid referral code to claim your $50 bonus
                  </p>
                </form>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>How Referrals Work</CardTitle>
              <CardDescription>
                Simple steps to earn bonuses through our referral program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">Share Your Link</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral link or code with friends and family.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">They Sign Up</h3>
                  <p className="text-sm text-muted-foreground">
                    When they create an account using your link or enter your code.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">You Get Rewarded</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn a $50 bonus for each friend who joins and invests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReferralsPage;
