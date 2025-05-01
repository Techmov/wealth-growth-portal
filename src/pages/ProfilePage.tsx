
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and view your details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your personal details and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email Address</div>
                    <div className="font-medium">{user.email}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Account Created</div>
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Referral Code</div>
                    <div className="font-mono font-medium">{user.referralCode}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="font-medium mb-4">Account Summary</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
                      <div className="text-lg font-bold">${user.balance.toFixed(2)}</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
                      <div className="text-lg font-bold">${user.totalInvested.toFixed(2)}</div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Withdrawn</div>
                      <div className="text-lg font-bold">${user.totalWithdrawn.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/change-password")}
                >
                  Change Password
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/transactions")}
                >
                  Manage Funds
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/referrals")}
                >
                  Referral Program
                </Button>
                
                <div className="pt-4 border-t mt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
