
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";

/**
 * Hook for managing authentication controller logic
 * This combines useAuthState and useAuthActions to maintain backward compatibility
 */
export const useAuthController = () => {
  // Get state management from useAuthState
  const {
    user,
    setUser,
    profile,
    setProfile,
    session,
    setSession,
    isLoading,
    setIsLoading,
    isAdmin,
    setIsAdmin,
    loginSuccess,
    setLoginSuccess,
    resetLoginSuccess,
    fetchProfile
  } = useAuthState();

  // Get authentication actions from useAuthActions
  const {
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  } = useAuthActions({
    user,
    setIsLoading, 
    setSession,
    fetchProfile,
    setLoginSuccess
  });

  // Return combined state and actions for backward compatibility
  return {
    // State
    user,
    setUser,
    profile,
    setProfile,
    session,
    setSession,
    isLoading,
    setIsLoading,
    isAdmin,
    setIsAdmin,
    loginSuccess,
    resetLoginSuccess,
    
    // Methods
    fetchProfile,
    login,
    signup,
    logout,
    updateUser,
    updateTrc20Address,
    requestWithdrawal,
    deposit
  };
};
