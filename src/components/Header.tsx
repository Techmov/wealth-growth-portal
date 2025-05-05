
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Menu, X, Home, Users, TrendingUp, UserCircle, Shield, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close the mobile menu when the window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const navItems = [
    { title: "Dashboard", path: "/dashboard", icon: Home, authRequired: true },
    { title: "Investments", path: "/investments", icon: TrendingUp, authRequired: true },
    { title: "Deposit", path: "/deposit", icon: TrendingUp, authRequired: true },
    { title: "Withdraw", path: "/withdraw", icon: TrendingUp, authRequired: true },
    { title: "Referrals", path: "/referrals", icon: Users, authRequired: true },
    { title: "Profile", path: "/profile", icon: UserCircle, authRequired: true },
  ];

  // Admin specific navigation item
  const adminNavItem = { title: "Admin", path: "/admin/dashboard", icon: Shield, authRequired: true, adminOnly: true };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <div className="text-2xl font-bold bg-gradient-to-r from-wealth-primary to-wealth-accent bg-clip-text text-transparent">
            WealthGrow
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (!item.authRequired || user) && (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "transition-colors flex items-center gap-2",
                  isActive 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
          
          {/* Admin Link - Only visible for admins */}
          {user?.role === 'admin' && (
            <Link 
              to={adminNavItem.path}
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-medium"
            >
              <adminNavItem.icon className="h-4 w-4" />
              {adminNavItem.title}
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <button className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation with SOLID BLACK background */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 flex flex-col md:hidden",
          mobileMenuOpen ? "animate-in slide-in-from-top" : "hidden"
        )}
        style={{ 
          backgroundColor: '#000000', // Solid black background
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      >
        <div className="container py-4 flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = window.location.pathname === item.path;
            return (!item.authRequired || user) && (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg py-2 border-b border-gray-800 flex items-center gap-2",
                  isActive 
                    ? "text-white bg-gray-800 px-2 rounded-md" 
                    : "text-white"
                )}
                onClick={closeMobileMenu}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
          
          {/* Mobile Admin Link - Only visible for admins */}
          {user?.role === 'admin' && (
            <Link 
              to={adminNavItem.path}
              className={cn(
                "text-lg py-2 border-b border-gray-800 flex items-center gap-2",
                window.location.pathname === adminNavItem.path 
                  ? "text-primary bg-gray-800 px-2 rounded-md"
                  : "text-primary"
              )}
              onClick={closeMobileMenu}
            >
              <adminNavItem.icon className="h-5 w-5" />
              {adminNavItem.title}
            </Link>
          )}
          
          {user ? (
            <>
              <Button className="mt-4" onClick={() => { logout(); closeMobileMenu(); }}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-900">Login</Button>
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
