
import { supabase } from "@/integrations/supabase/client";
import { LoginCredentials, SignupCredentials } from "@/types/auth";

// Withdrawal fee constant
const WITHDRAWAL_FEE = 3;

// Sign up with email and password
export const signup = async (credentials: SignupCredentials) => {
  const { email, password, name } = credentials;
  
  try {
    // Create user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return Promise.reject(error);
    }

    // If successful, return the data
    return Promise.resolve(data);
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return Promise.reject(error);
  }
};

// Login with email and password
export const login = async (credentials: LoginCredentials) => {
  const { email, password } = credentials;
  
  try {
    console.log("authService: Login attempt with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("authService: Login error:", error);
      return Promise.reject(error);
    }

    console.log("authService: Login successful, returning session");
    return Promise.resolve(data);
  } catch (error) {
    console.error("authService: Unexpected login error:", error);
    return Promise.reject(error);
  }
};

// Logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return Promise.reject(error);
    }
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Fetch user profile
export const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      return Promise.reject(error);
    }
    
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update profile data
export const updateProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      return Promise.reject(error);
    }
    
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Updated version of updateTrc20Address with proper user ID handling
export const updateTrc20Address = async (userId: string, address: string, withdrawalPassword?: string) => {
  try {
    // Create update data object
    const updateData: any = { trc20_address: address };
    
    // Add withdrawal password if provided
    if (withdrawalPassword) {
      updateData.withdrawal_password = withdrawalPassword;
    }
    
    // This now properly passes the user ID and includes the withdrawal password
    await updateProfile(userId, updateData);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Add deposit function for TransactionsPage
export const deposit = async (userId: string, amount: number, txHash: string) => {
  try {
    // Create a deposit transaction record
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'deposit',
        status: 'pending',
        tx_hash: txHash,
        description: 'Manual deposit request'
      });
      
    if (error) {
      return Promise.reject(error);
    }
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update the withdrawal request function to include withdrawal source parameter and fee
export const requestWithdrawal = async (
  userId: string, 
  amount: number, 
  trc20Address: string,
  withdrawalSource: 'profit' | 'referral_bonus' = 'profit'
) => {
  try {
    // Use the database function for withdrawal requests with updated parameters
    const { data, error } = await supabase.rpc(
      'request_withdrawal',
      {
        p_user_id: userId,
        p_amount: amount + WITHDRAWAL_FEE,  // Total amount including fee
        p_trc20_address: trc20Address,
        p_withdrawal_source: withdrawalSource,
        p_fee_amount: WITHDRAWAL_FEE  // Pass fee amount separately
      }
    );
      
    if (error) {
      return Promise.reject(error);
    }
    
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
