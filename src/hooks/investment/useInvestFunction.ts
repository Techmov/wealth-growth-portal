
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useInvestFunction(user: User | null) {
  const invest = async (productId: string) => {
    if (!user) {
      toast.error("You must be logged in to invest");
      return;
    }

    try {
      console.log("Attempting investment for product:", productId);

      // Use Supabase Edge Function to create the investment
      const response = await supabase.functions.invoke("create-investment", {
        body: { 
          userId: user.id, 
          productId: productId 
        },
      });
      
      // Check for errors in the response
      if (response.error || !response.data) {
        const errorMessage = response.error?.message || "Investment creation failed";
        console.error("Investment error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Check for error property in the data
      if (response.data.error) {
        const errorMessage = response.data.error || "Investment failed";
        console.error("Investment error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Investment successful:", response.data);
      toast.success("Investment successful! Your portfolio has been updated");
      
      return response.data;
    } catch (error: any) {
      console.error("Investment failed:", error);
      toast.error(error.message || "Investment failed");
      throw error;
    }
  };

  return { invest };
}
