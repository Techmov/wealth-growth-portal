
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthFormFooter } from "@/components/auth/AuthFormFooter";
import { SubmitButton } from "@/components/auth/SubmitButton";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { login, user, isLoading, loginSuccess, resetLoginSuccess } = useAuth();
  const navigate = useNavigate();

  // Effect to handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && !isLoading) {
      console.log("LoginPage: Login success flag detected, navigating to dashboard");
      resetLoginSuccess();
      navigate("/dashboard", { replace: true });
    }
  }, [loginSuccess, isLoading, navigate, resetLoginSuccess]);

  // Effect to handle already authenticated users
  useEffect(() => {
    if (user && !isLoading) {
      console.log("LoginPage: User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("LoginPage: Attempting login with email:", email);
      
      await login(email, password);
      console.log("LoginPage: Login function completed");
      // The redirect is now handled by the useEffect
    } catch (error: any) {
      console.error("LoginPage: Login error:", error);
      setError(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <AuthFormFooter 
      text="Don't have an account?" 
      linkText="Sign up" 
      linkTo="/signup" 
    />
  );

  return (
    <AuthLayout title="Login" description="Enter your credentials to access your account">
      <AuthCard 
        title="Login" 
        description="Enter your credentials to access your account"
        footer={footer}
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="pt-2">
            <SubmitButton 
              isSubmitting={isSubmitting} 
              submittingText="Logging in..."
              defaultText="Login"
            />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
