
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/UserLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useReferralSystem } from "@/hooks/useReferralSystem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Copy, Users, Coins, Share2, Clock, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";
import { format } from "date-fns";

const ReferralsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    referralLink,
    copyReferralLink,
    downlines,
    isLoading,
    referralStats,
  } = useReferralSystem(user);

  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <UserLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Referral Program</h1>
        <p className="text-muted-foreground mb-8">
          Invite friends and earn 5% bonus on their investments
        </p>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Referred Users"
            value={referralStats.totalReferrals.toString()}
            description="Users you've referred"
            icon={<Users className="h-5 w-5 text-blue-600" />}
          />
          <StatCard
            title="Total Bonus Earned"
            value={`$${referralStats.totalBonusEarned.toFixed(2)}`}
            description="From referrals"
            icon={<Coins className="h-5 w-5 text-green-600" />}
          />
          <StatCard
            title="Referral Balance"
            value={`$${user.referralBonus.toFixed(2)}`}
            description="Available to withdraw"
            icon={<Gift className="h-5 w-5 text-purple-600" />}
          />
        </div>

        {/* Share Referral Link */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" /> Share Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with your friends and earn 5% when they invest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralLink} className="gap-1">
                  <Copy className="h-4 w-4" /> Copy Link
                </Button>
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center mb-2">
                  <div className="rounded-full bg-primary/10 p-2 mr-2">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Your Referral Code</h3>
                </div>
                <p className="text-2xl font-bold tracking-wide text-center py-2 border rounded-lg bg-background">
                  {user.referralCode}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Users can enter this code during sign up or apply it later in their profile
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Downlines Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Your Referrals
            </CardTitle>
            <CardDescription>
              List of users you've referred and bonuses earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
              </div>
            ) : downlines.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead>Total Invested</TableHead>
                      <TableHead>Bonus Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downlines.map((downline) => (
                      <TableRow key={downline.id}>
                        <TableCell>{downline.username}</TableCell>
                        <TableCell>{format(downline.date, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>${downline.totalInvested.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">
                          ${downline.bonusGenerated.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <div className="mb-3 inline-flex p-3 bg-muted rounded-full">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No Referrals Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your referral code to start earning bonuses
                </p>
                <Button onClick={copyReferralLink} variant="outline">
                  Copy Referral Link
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> How Referrals Work
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share your referral link or code with friends</li>
                <li>• When they sign up and invest, you earn 5% of their investment amount</li>
                <li>• Your referral bonuses are added to your account automatically</li>
                <li>• You can withdraw your referral bonuses at any time</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => navigate("/withdrawal")} 
              className="w-full flex items-center justify-center gap-2"
            >
              Withdraw Referral Bonuses <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </UserLayout>
  );
};

export default ReferralsPage;
