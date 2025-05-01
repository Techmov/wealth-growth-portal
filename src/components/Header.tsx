
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { title: "Dashboard", path: "/dashboard", authRequired: true },
    { title: "Investments", path: "/investments", authRequired: true },
    { title: "Deposit/Withdraw", path: "/transactions", authRequired: true },
    { title: "Referrals", path: "/referrals", authRequired: true },
  ];

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
          {navItems.map((item) => 
            (!item.authRequired || user) && (
              <Link 
                key={item.path}
                to={item.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
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
        <button className="md:hidden" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 flex flex-col bg-background md:hidden",
          mobileMenuOpen ? "animate-in slide-in-from-top" : "hidden"
        )}
      >
        <div className="container py-4 flex flex-col gap-4">
          {navItems.map((item) => 
            (!item.authRequired || user) && (
              <Link 
                key={item.path}
                to={item.path}
                className="text-lg py-2 border-b border-muted"
                onClick={closeMobileMenu}
              >
                {item.title}
              </Link>
            )
          )}
          
          {user ? (
            <>
              <Link 
                to="/profile" 
                className="text-lg py-2 border-b border-muted"
                onClick={closeMobileMenu}
              >
                Profile
              </Link>
              <Button className="mt-4" onClick={() => { logout(); closeMobileMenu(); }}>
                Logout
              </Button>
            </>
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
