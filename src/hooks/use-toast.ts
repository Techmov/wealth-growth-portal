
import { toast } from "sonner";

// Export toast directly
export { toast } from "sonner";

// Define hook for consistency with shadcn pattern
export const useToast = () => {
  return {
    toast,
  };
};
