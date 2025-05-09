
// This file contains type definitions specific to authentication
// Most auth types are already defined in @/types.ts and @/types/supabase.ts

import { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthSignupData {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface AuthLoginData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
