
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/ModeToggle";
import { 
  NavigationMenu, NavigationMenuLink, NavigationMenuList, NavigationMenuItem,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, LogOut, Menu, User, Settings, LayoutDashboard, 
  CreditCard, PiggyBank, Users2, BarChart } from "lucide-react";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Navigate to admin dashboard if user is admin
  const handleDashboardClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is now handled inside the logout function
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full ${
        isScrolled ? 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : ''
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center font-bold text-xl">
            <span>Wealth</span>
            <span className="text-primary">Growth</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {user ? (
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </Link>
                </NavigationMenuItem>
                {!isAdmin && (
                  <>
                    <NavigationMenuItem>
                      <Link to="/investments" className={navigationMenuTriggerStyle()}>
                        Investments
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/deposit" className={navigationMenuTriggerStyle()}>
                        Deposit
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/withdrawal" className={navigationMenuTriggerStyle()}>
                        Withdraw
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  {user.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isAdmin && (
                  <>
                    <DropdownMenuItem onSelect={() => navigate("/transactions")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Transactions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate("/referrals")}>
                      <Users2 className="mr-2 h-4 w-4" />
                      <span>Referrals</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex gap-4 items-center">
            <ModeToggle />
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          
          {user ? (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col mt-4 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-2"
                    onClick={handleDashboardClick}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>

                  {!isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                        onClick={() => {
                          navigate('/investments');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <BarChart className="h-4 w-4" />
                        Investments
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                        onClick={() => {
                          navigate('/deposit');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Deposit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                        onClick={() => {
                          navigate('/withdrawal');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <PiggyBank className="h-4 w-4" />
                        Withdraw
                      </Button>

                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                        onClick={() => {
                          navigate('/transactions');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Transactions
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                        onClick={() => {
                          navigate('/referrals');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Users2 className="h-4 w-4" />
                        Referrals
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-2"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
