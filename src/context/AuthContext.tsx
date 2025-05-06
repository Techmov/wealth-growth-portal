
  // Update TRC20 address function
  const updateTrc20Address = async (address: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    try {
      await updateTrc20AddressService(user.id, address);
      // Refresh profile data
      fetchProfile(user.id);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
