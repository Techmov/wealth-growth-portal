
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/supabase";

// Login function using Supabase auth
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    toast.error("Login Failed", {
      description: error.message
    });
    throw error;
  }
  
  if (data?.user) {
    toast.success("Login Successful", {
      description: `Welcome back!`
    });
  }
  
  return data;
};

// Signup function using Supabase auth
export const signup = async (name: string, email: string, password: string, referralCode?: string) => {
  // Generate a unique referral code client-side as fallback
  const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Sign up with email and password
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        referral_code: userReferralCode
      }
    }
  });
  
  if (error) {
    toast.error("Signup Failed", {
      description: error.message
    });
    throw error;
  }
  
  // Handle successful signup
  if (data?.user) {
    console.log("User signed up successfully, creating profile manually");
    
    // Always create profile manually since the database trigger might fail
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        name: name,
        email: email,
        username: `user_${data.user.id.substring(0, 8)}`,
        referral_code: userReferralCode,
        referred_by: referralCode || null,
        balance: 0,
        total_invested: 0,
        total_withdrawn: 0,
        referral_bonus: 0,
        role: 'user'
      }, { onConflict: 'id' });
      
    if (profileError) {
      console.error("Error creating profile:", profileError);
      toast.warning("Profile Creation Issue", {
        description: "Your account was created but there might be an issue with your profile. Please contact support if you experience any problems."
      });
    } else {
      toast.success("Signup Successful", {
        description: "Your account has been created successfully."
      });
    }
  }
  
  return data;
};

// Logout function using Supabase auth
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast.error("Logout Failed", {
      description: error.message
    });
    throw error;
  }
  
  toast.success("Logged out", {
    description: "You have been successfully logged out."
  });
  
  return true;
};

// Update profile function
export const updateProfile = async (userId: string, userData: Partial<Profile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', userId);
  
  if (error) {
    toast.error("Update Failed", {
      description: error.message
    });
    throw error;
  }
  
  toast.success("Profile Updated", {
    description: "Your profile has been successfully updated."
  });
  
  return true;
};

// Update TRC20 address function
export const updateTrc20Address = async (address: string) => {
  // This is a wrapper around updateProfile for specific address updates
  try {
    await updateProfile('', { trc20_address: address });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Deposit function
export const deposit = async (userId: string, amount: number, txHash: string, screenshot?: File) => {
  let screenshotUrl: string | undefined = undefined;
  
  // If screenshot is provided, upload it to storage
  if (screenshot) {
    const fileExt = screenshot.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deposit_screenshots')
      .upload(fileName, screenshot);
    
    if (uploadError) {
      toast.error("Upload Failed", {
        description: uploadError.message
      });
      throw uploadError;
    }
    
    // Get public URL for the screenshot
    const { data: urlData } = supabase.storage
      .from('deposit_screenshots')
      .getPublicUrl(fileName);
    
    screenshotUrl = urlData.publicUrl;
  }
  
  // Create transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      status: 'pending',
      type: 'deposit',
      tx_hash: txHash,
      deposit_screenshot: screenshotUrl
    });
  
  if (transactionError) {
    toast.error("Deposit Failed", {
      description: transactionError.message
    });
    throw transactionError;
  }
  
  toast.success("Deposit Received", {
    description: "Your deposit request has been received and is pending approval."
  });
  
  return true;
};

// Request withdrawal function
export const requestWithdrawal = async (userId: string, profile: Profile, amount: number) => {
  if (amount > (profile.balance || 0)) {
    toast.error("Withdrawal Failed", {
      description: "Insufficient balance"
    });
    return Promise.reject(new Error("Insufficient balance"));
  }
  
  if (!profile.trc20_address) {
    toast.error("Withdrawal Failed", {
      description: "Please set your TRC20 address before requesting withdrawal"
    });
    return Promise.reject(new Error("TRC20 address not set"));
  }
  
  // Create withdrawal request
  const { error } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: userId,
      amount,
      status: 'pending',
      trc20_address: profile.trc20_address
    });
  
  if (error) {
    toast.error("Withdrawal Request Failed", {
      description: error.message
    });
    throw error;
  }
  
  // Update user balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: (profile.balance || 0) - amount
    })
    .eq('id', userId);
  
  if (updateError) {
    toast.error("Balance Update Failed", {
      description: updateError.message
    });
    throw updateError;
  }
  
  toast.success("Withdrawal Requested", {
    description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted for approval.`
  });
  
  return true;
};
