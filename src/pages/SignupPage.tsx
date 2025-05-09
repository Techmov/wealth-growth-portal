
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthFormFooter } from "@/components/auth/AuthFormFooter";
import { SubmitButton } from "@/components/auth/SubmitButton";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Extract referral code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signup(name, email, password, referralCode);
      toast.success("Account created! Please check your email for verification.");
      // Show a toast message informing the user about the verification email
      toast.info("Please verify your email before logging in.");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("Database error saving new user")) {
        setError("We're experiencing technical difficulties with user registration. Please try again later or contact support.");
        toast.error("Registration system is currently unavailable. Please try again later.");
      } else if (error.message?.includes("User already registered")) {
        setError("Email already in use. Please log in instead.");
        toast.error("Account already exists with this email.");
      } else {
        setError(error.message || "Failed to create account. Please try again.");
        toast.error("Signup failed. Please check your information and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <AuthFormFooter 
      text="Already have an account?" 
      linkText="Login" 
      linkTo="/login" 
    />
  );

  return (
    <AuthLayout title="Create an Account" description="Enter your details to create your account">
      <AuthCard 
        title="Create an Account" 
        description="Enter your details to create your account"
        footer={footer}
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
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
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code (Optional)</Label>
            <Input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code if you have one"
            />
          </div>
          
          <SubmitButton 
            isSubmitting={isSubmitting} 
            submittingText="Creating Account..."
            defaultText="Create Account"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignupPage;
