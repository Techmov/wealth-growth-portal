import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

const ProfilePage = () => {
  const { user, logout, updateTrc20Address } = useAuth();
  const navigate = useNavigate();
  const [trc20Address, setTrc20Address] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.trc20Address) {
      setTrc20Address(user.trc20Address);
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleSaveTrc20Address = async () => {
    if (!trc20Address) {
      toast.error("Please enter a valid TRC20 address");
      return;
    }

    try {
      await updateTrc20Address(trc20Address);
      setIsEditing(false);
      toast.success("TRC20 address updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update TRC20 address");
    }
  };

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

                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">TRC20 Withdrawal Address</div>
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <Input 
                          value={trc20Address} 
                          onChange={(e) => setTrc20Address(e.target.value)}
                          placeholder="Enter your TRC20 address"
                          className="font-mono"
                        />
                        <Button size="sm" onClick={handleSaveTrc20Address}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setIsEditing(false);
                          setTrc20Address(user.trc20Address || "");
                        }}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="font-mono font-medium break-all">
                          {user.trc20Address || "No address set"}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          {user.trc20Address ? "Change" : "Add"}
                        </Button>
                      </div>
                    )}
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
