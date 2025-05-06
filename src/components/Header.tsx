
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Menu, X, Home, Users, TrendingUp, UserCircle, Shield, ArrowUp, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a type for navigation items
interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  iconClass?: string;
  className?: string;
}

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Dynamic navigation items based on authentication state
  const getNavItems = (): NavItem[] => {
    // Base navigation items always visible
    const baseItems: NavItem[] = user ? [
      { title: "Dashboard", path: "/dashboard", icon: Home },
      { title: "Investments", path: "/investments", icon: TrendingUp },
      { title: "Deposit", path: "/deposit", icon: ArrowUp },
      { title: "Withdraw", path: "/withdraw", icon: ArrowUp, iconClass: "rotate-180" },
      { title: "Referrals", path: "/referrals", icon: Users },
      { title: "Profile", path: "/profile", icon: UserCircle },
    ] : [
      { title: "Home", path: "/", icon: Home },
      { title: "Investment Plans", path: "/investments", icon: TrendingUp },
    ];

    // Admin nav item - only visible for admins
    if (user?.role === 'admin') {
      baseItems.push({ 
        title: "Admin", 
        path: "/admin/dashboard", 
        icon: Shield, 
        className: "text-primary hover:text-primary/80 font-medium"
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0" onClick={closeMobileMenu}>
          <div className="text-2xl font-bold bg-gradient-to-r from-wealth-primary to-wealth-accent bg-clip-text text-transparent">
            WealthGrow
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 transition-colors whitespace-nowrap",
                isActive(item.path) 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground",
                item.className
              )}
            >
              <item.icon className={cn("h-4 w-4", item.iconClass)} />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Show balance for authenticated users */}
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                <Wallet className="h-4 w-4 text-wealth-primary" />
                <span>${user.balance.toFixed(2)}</span>
              </div>
              
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <span className="hidden lg:inline">Logout</span>
                <span className="lg:hidden">Exit</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden lg:inline">Login</span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMobileMenu} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 flex flex-col bg-background md:hidden",
          mobileMenuOpen ? "animate-in slide-in-from-top" : "hidden"
        )}
        style={{ 
          backgroundColor: 'var(--background)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      >
        <div className="container py-4 flex flex-col gap-4">
          {user && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-wealth-primary" />
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                <Wallet className="h-4 w-4 text-wealth-primary" />
                <span>${user.balance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "text-lg py-3 border-b border-muted flex items-center gap-2",
                isActive(item.path) ? "text-foreground font-medium" : "text-muted-foreground",
                item.className
              )}
              onClick={closeMobileMenu}
            >
              <item.icon className={cn("h-5 w-5", item.iconClass)} />
              {item.title}
            </Link>
          ))}
          
          {user ? (
            <Button className="mt-4" onClick={() => { logout(); closeMobileMenu(); }}>
              Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link to="/signup" onClick={closeMobileMenu}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
