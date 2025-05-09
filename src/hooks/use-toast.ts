
import { toast, type Toast } from "sonner";

// Export toast directly
export { toast } from "sonner";

// Define the type for our toast function parameters
export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

// Define hook for consistency with shadcn pattern
export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant, action } = props;
      return variant === "destructive"
        ? toast.error(title, { description, action })
        : toast(title, { description, action });
    }
  };
};
