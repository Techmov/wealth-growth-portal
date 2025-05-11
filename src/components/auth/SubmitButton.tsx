
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  submittingText: string;
  defaultText: string;
  className?: string;
}

export function SubmitButton({
  isSubmitting,
  submittingText,
  defaultText,
  className = "w-full"
}: SubmitButtonProps) {
  return (
    <Button type="submit" className={className} disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {submittingText}
        </>
      ) : (
        defaultText
      )}
    </Button>
  );
}
