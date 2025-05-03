
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const ReferralsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Generate referral link
  const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied to clipboard");
  };

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
              <Button onClick={copyReferralLink} className="w-full">
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
                Earn 10% of your friend's deposit when they sign up and make a deposit
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
                <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                  <h3 className="font-medium text-green-700 mb-2">Automatic Referral Bonuses</h3>
                  <p className="text-sm text-green-600 mb-2">
                    When your friend signs up using your link and makes a deposit, you automatically receive 10% of 
                    their deposit amount in your account balance.
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    No claims needed - bonuses are added instantly!
                  </p>
                </div>
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
                  <h3 className="font-semibold mb-2">They Sign Up & Deposit</h3>
                  <p className="text-sm text-muted-foreground">
                    When they create an account using your link and make their first deposit.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">You Get Rewarded Instantly</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 10% of your friend's deposit amount automatically added to your balance.
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
