
import { supabase } from "@/integrations/supabase/client";
import { User, LoginCredentials, SignupCredentials } from "@/types/auth";

// Sign up with email and password
export const signup = async (credentials: SignupCredentials) => {
  const { email, password, name, referralCode } = credentials;
  
  try {
    // Create user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          referred_by: referralCode || null,
        },
      },
    });

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Login with email and password
export const login = async (credentials: LoginCredentials) => {
  const { email, password } = credentials;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve(data);
  } catch (error) {
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
export const updateTrc20Address = async (userId: string, address: string) => {
  try {
    // This now properly passes the user ID
    await updateProfile(userId, { trc20_address: address });
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
