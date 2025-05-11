
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AuthFormFooter } from "@/components/auth/AuthFormFooter";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional()
});

type FormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showReferralField, setShowReferralField] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralCode: ""
    }
  });
  
  // Check for referral code in URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    
    if (ref) {
      form.setValue("referralCode", ref);
      setShowReferralField(true);
    }
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    
    try {
      const result = await signup(data.name, data.email, data.password, data.referralCode || undefined);
      
      if (result?.error) {
        setError(result.error.message);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput 
                    id="password"
                    placeholder="Create a password" 
                    value={field.value} 
                    onChange={field.onChange}
                    required={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showReferralField ? (
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter referral code (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="pt-2">
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-sm"
                onClick={() => setShowReferralField(true)}
              >
                Have a referral code?
              </Button>
            </div>
          )}
          
          <SubmitButton
            isSubmitting={form.formState.isSubmitting}
            submittingText="Creating Account..."
            defaultText="Create Account"
          />
          
          <AuthFormFooter
            text="Already have an account?"
            linkText="Sign in"
            linkTo="/login"
          />
        </form>
      </Form>
    </div>
  );
}
