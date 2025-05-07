
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Users, Link, BarChart, TrendingUp, Share, UserPlus, CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useInvestment } from "@/context/InvestmentContext";
import { Downline } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { DownlinesList } from "@/components/DownlinesList";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/StatCard";

const ReferralsPage = () => {
  const { user } = useAuth();
  const { getUserDownlines } = useInvestment();
  const isMobile = useIsMobile();
  
  const [copyText, setCopyText] = useState("Copy");
  const [downlines, setDownlines] = useState<Downline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const referralLink = user ? `${window.location.origin}/signup?ref=${user.referralCode}` : "";
  
  // Calculate statistics
  const totalReferrals = downlines.length;
  const totalInvested = downlines.reduce((sum, downline) => sum + downline.totalInvested, 0);
  const totalBonusEarned = downlines.reduce((sum, downline) => sum + downline.bonusGenerated, 0);
  const activeReferrals = downlines.filter(d => d.totalInvested > 0).length;
  const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

  // Function to handle copying referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyText("Copied!");
    toast.success("Referral link copied to clipboard");
    setTimeout(() => setCopyText("Copy"), 2000);
  };
  
  // Function to share on social media
  const handleShare = async (platform: string) => {
    const message = `Join my investment platform and start earning with my referral link: ${referralLink}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join my investment platform!')}`, '_blank');
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Investment Referral',
              text: message,
              url: referralLink,
            });
            toast.success('Shared successfully');
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          handleCopyLink();
        }
    }
  };

  // Fetch downlines
  const fetchDownlines = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getUserDownlines();
      setDownlines(data);
    } catch (error) {
      console.error("Error fetching downlines:", error);
      toast.error("Failed to load your referrals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownlines();
    
    // Set up interval to refresh data periodically
    const intervalId = setInterval(fetchDownlines, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);

  if (!user) return null;

  return (
    <UserLayout>
      <div className="container py-6 space-y-6">
        <Heading
          title="Referrals Program"
          description="Invite friends and earn 5% commission on their investments"
          icon={<Users className="h-6 w-6" />}
        />

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Referrals"
            value={totalReferrals}
            icon={<UserPlus className="h-5 w-5" />}
            description="People you've referred"
          />
          
          <StatCard
            title="Active Referrals"
            value={activeReferrals}
            icon={<Users className="h-5 w-5" />}
            description={`${conversionRate.toFixed(1)}% conversion`}
          />
          
          <StatCard
            title="Total Invested"
            value={`$${totalInvested.toFixed(2)}`}
            icon={<BarChart className="h-5 w-5" />}
            description="By your referrals"
          />
          
          <StatCard
            title="Commission Earned"
            value={`$${totalBonusEarned.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-green-600"
            description="5% of investments"
            isGrowing={true}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link to earn 5% of your referrals' investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="text-sm font-medium">Your Referral Code</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg py-2 px-3">
                      {user.referralCode || "Loading..."}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="text-sm font-medium">Referral Link</div>
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                    <div className="bg-muted px-3 py-2 rounded-md text-sm truncate flex-1">
                      {referralLink}
                    </div>
                    <Button size="sm" onClick={handleCopyLink} className="whitespace-nowrap">
                      <Copy className="h-4 w-4 mr-2" />
                      {copyText}
                    </Button>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Share on Social Media</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleShare('facebook')}>
                      Facebook
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare('twitter')}>
                      Twitter
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')}>
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare('telegram')}>
                      Telegram
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare('')}>
                      <Share className="h-4 w-4 mr-2" />
                      More Options
                    </Button>
                  </div>
                </div>

                {/* Referral Program Progress */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Referral Performance</span>
                    <span className="text-sm text-muted-foreground">{conversionRate.toFixed(1)}% conversion rate</span>
                  </div>
                  <Progress value={conversionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {activeReferrals} of {totalReferrals} referrals have made investments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Our referral program gives you passive income for every friend who invests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Link className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">1. Share Your Unique Link</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy your personal referral link and share it with friends, family, or on your social media platforms.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">2. Friends Create Accounts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      When someone uses your link to register, they are permanently recorded as your referral, even if they invest later.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">3. Your Referrals Invest</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every single time your referrals make an investment of any amount, you earn commission – with no limits or caps!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">4. Earn 5% Commission Instantly</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You automatically receive 5% of every investment amount, instantly deposited to your balance and ready to withdraw anytime.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Downlines List with Real-time Updates */}
        <DownlinesList downlines={downlines} isLoading={isLoading} />
      </div>
    </UserLayout>
  );
};

export default ReferralsPage;
