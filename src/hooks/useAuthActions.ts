import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as authService from "@/services/authService";

const WITHDRAWAL_FEE = 0;

export const useAuthActions = ({
  user,
  setIsLoading,
  setSession,
  fetchProfile,
  setLoginSuccess,
  setUser,
}) => {
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login({ email, password });

      if (!result || !result.session) {
        toast.error("Failed to login");
        return { success: false };
      }

      const session = result.session;
      setSession(session);

      try {
        await fetchProfile(session.user.id);
        setLoginSuccess(true);
        toast.success("Login successful!", {
          description: "Welcome back to your account.",
        });
        return { success: true, session };
      } catch (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Login successful but error loading profile data");
        return { success: true, session };
      }
    } catch (error: any) {
      if (error.message?.includes("Email not confirmed")) {
        toast.error("Please confirm your email before logging in");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to login");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    referralCode?: string
  ) => {
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username: generateUsername(name, email),
          },
        },
      });

      if (authError) {
        const errorMsg = authError.message?.toLowerCase();
        console.log("Supabase signup error:", authError.message);

        if (
          errorMsg.includes("user already registered") ||
          errorMsg.includes("signups not allowed") ||
          errorMsg.includes("already exists") ||
          errorMsg.includes("email") // fallback catch
        ) {
          toast.error("Email is already registered. Please log in instead.");
          return { error: "Email is already registered." };
        }

        toast.error("Signup failed", {
          description: authError.message,
        });

        return { error: authError.message };
      }

      const user = authData.user;

      if (!user) {
        toast.success("Signup successful", {
          description: "Check your email for the confirmation link.",
        });
        return { message: "Check your email for the confirmation link." };
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        username: generateUsername(name, email),
        email,
        referred_by: referralCode?.toUpperCase() || null,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      if (authData.session) {
        setSession(authData.session);
        await fetchProfile(user.id);
        setLoginSuccess(true);
      }

      toast.success("Signup successful", {
        description: "Confirmation email sent. Please check your inbox.",
      });

      return authData.session
        ? authData
        : { message: "Check your email for the confirmation link." };
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("Signup failed", {
        description: error.message || "An unexpected error occurred.",
      });
      return {
        error: "An error occurred during sign-up. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      setSession(null);
      const toastId = toast.loading("Logging out...");
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        toast.error("An error occurred during logout", {
          id: toastId,
          description: error.message,
        });
        throw error;
      }

      toast.success("Logged out successfully", { id: toastId });
      window.location.href = "/";
    } catch (error: any) {
      toast.error("Logout failed", {
        description: "Please try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: any) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    try {
      setIsLoading(true);
      const toastId = toast.loading("Updating profile...");
      const { error } = await supabase
        .from("profiles")
        .update(userData)
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update profile", {
          id: toastId,
          description: error.message,
        });
        return Promise.reject(error);
      }

      await fetchProfile(user.id);
      toast.success("Profile updated successfully", { id: toastId });
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error.message,
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrc20Address = async (
    address: string,
    withdrawalPassword?: string
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const toastId = toast.loading("Updating withdrawal address...");
      const updateData: any = { trc20_address: address };

      if (withdrawalPassword) {
        updateData.withdrawal_password = withdrawalPassword;
      }

      await supabase.from("profiles").update(updateData).eq("id", user.id);
      await fetchProfile(user.id);

      toast.success("Withdrawal address updated", {
        id: toastId,
        description: "Your TRC20 address was successfully updated.",
      });
    } catch (error: any) {
      toast.error("Failed to update address", {
        description: error.message,
      });
      return Promise.reject(error);
    }
  };

  const deposit = async (amount: number, txHash: string) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount,
        type: "deposit",
        status: "pending",
        tx_hash: txHash,
        description: "Manual deposit request",
      });

      if (error) {
        return Promise.reject(error);
      }

      return Promise.resolve();
    } catch (error: any) {
      toast.error("Failed to submit deposit", {
        description: error.message,
      });
      return Promise.reject(error);
    }
  };

  const requestWithdrawal = async (
    amount: number,
    trc20Address: string,
    withdrawalSource: "profit" | "referral_bonus" = "profit",
    withdrawalPassword?: string
  ) => {
    if (!user) {
      toast.error("User not authenticated");
      return Promise.reject(new Error("User not authenticated"));
    }

    if (!trc20Address) {
      toast.error("Please set your TRC20 address first");
      return Promise.reject(new Error("TRC20 address not set"));
    }

    if (amount <= 0 || amount < 10) {
      toast.error("Minimum withdrawal amount is 10 USDT");
      return Promise.reject(new Error("Invalid amount"));
    }

    if (
      user.withdrawalPassword &&
      withdrawalPassword !== user.withdrawalPassword
    ) {
      toast.error("Incorrect withdrawal password");
      return Promise.reject(new Error("Invalid withdrawal password"));
    }

    try {
      const toastId = toast.loading("Processing withdrawal request...");
      const { data, error } = await supabase.rpc("request_withdrawal", {
        p_user_id: user.id,
        p_amount: amount - WITHDRAWAL_FEE,
        p_trc20_address: trc20Address,
        p_withdrawal_source: withdrawalSource,
        p_fee_amount: WITHDRAWAL_FEE,
      });

      if (error) {
        toast.error("Failed to submit withdrawal request", {
          id: toastId,
          description: error.message,
        });
        return Promise.reject(error);
      }

      toast.success("Withdrawal request submitted", {
        id: toastId,
        description: `You will receive $${amount.toFixed(
          2
        )} after a $${WITHDRAWAL_FEE.toFixed(2)} fee. Processed within 24 hours.`,
      });

      return Promise.resolve(data);
    } catch (error: any) {
      toast.error("Failed to submit withdrawal request", {
        description: error.message,
      });
      return Promise.reject(error);
    }
  };

  return {
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit,
  };
};

// Helper function
const generateUsername = (name: string, email: string): string => {
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 10);

  if (baseUsername.length < 3) {
    baseUsername = email.split("@")[0].substring(0, 10);
  }

  const randomNum = Math.floor(Math.random() * 10000);
  return `${baseUsername}${randomNum}`;
};
