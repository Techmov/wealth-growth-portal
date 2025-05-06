
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
