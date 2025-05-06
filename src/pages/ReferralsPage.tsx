
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownlinesList } from "@/components/DownlinesList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Downline } from "@/types/supabase";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

const ReferralsPage = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  const [copyText, setCopyText] = useState("Copy");
  const [downlines, setDownlines] = useState<Downline[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 10;
  
  const referralLink = profile ? `${window.location.origin}/signup?ref=${profile.referral_code}` : "";

  // Function to handle copying referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyText("Copied!");
    toast({
      title: "Copied to clipboard",
      description: "Referral link copied to clipboard"
    });
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  // Function to fetch downlines with pagination
  const fetchDownlines = async (page: number) => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      
      // First, get total count for pagination
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', profile.referral_code);
      
      if (countError) {
        console.error("Error fetching referral count:", countError);
        return;
      }
      
      if (count !== null) {
        setTotalReferrals(count);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      // Then fetch the current page of downlines
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', profile.referral_code)
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching downlines:", error);
        return;
      }
      
      if (data) {
        const formattedDownlines: Downline[] = data.map(user => ({
          id: user.id,
          username: user.username || 'Anonymous',
          totalInvested: user.total_invested || 0,
          bonusGenerated: user.total_invested ? user.total_invested * 0.05 : 0, // Assuming 5% referral bonus
          date: new Date(user.created_at || Date.now())
        }));
        
        setDownlines(formattedDownlines);
      }
    } catch (error) {
      console.error("Unexpected error fetching downlines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize and set up real-time subscription
  useEffect(() => {
    // Initial fetch
    fetchDownlines(currentPage);
    
    // Set up real-time subscription for new referrals
    if (profile) {
      const channel = supabase
        .channel('referrals-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `referred_by=eq.${profile.referral_code}`
          },
          (payload) => {
            console.log('Profile change received:', payload);
            // Refresh data when changes occur
            fetchDownlines(currentPage);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <UserLayout>
      <div className="container py-6 space-y-6">
        <Heading
          title="Referrals"
          description="Invite friends and earn bonuses when they invest"
          icon={<Users className="h-6 w-6" />}
        />

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
                      {profile?.referral_code || "Loading..."}
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

                <div className="flex flex-col space-y-2">
                  <div className="text-sm font-medium">Statistics</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Total Referrals</div>
                      <div className="text-2xl font-bold">{totalReferrals}</div>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <div className="text-sm text-muted-foreground">Total Bonus</div>
                      <div className="text-2xl font-bold">${profile?.referral_bonus?.toFixed(2) || "0.00"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Learn about our referral program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Earn 5% Commission</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll earn 5% of the investment amount whenever your referrals make an investment.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Instant Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Bonuses are credited directly to your account balance and can be withdrawn anytime.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Unlimited Referrals</h3>
                  <p className="text-sm text-muted-foreground">
                    There's no limit to how many people you can refer or how much you can earn.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Promotional Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact support if you need banners or promotional content for your website.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Downlines</CardTitle>
            <CardDescription>
              People who have registered using your referral link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : downlines.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead className="text-right">Total Invested</TableHead>
                        <TableHead className="text-right">Bonus Generated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downlines.map((downline) => (
                        <TableRow key={downline.id}>
                          <TableCell className="font-medium">{downline.username}</TableCell>
                          <TableCell>
                            {downline.date.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">${downline.totalInvested.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${downline.bonusGenerated.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any referrals yet.</p>
                <p className="mt-2">Share your referral link to start earning bonuses!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default ReferralsPage;
