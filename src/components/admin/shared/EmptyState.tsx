
import React, { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  actionButton?: ReactNode;
}

export function EmptyState({ icon, message, actionButton }: EmptyStateProps) {
  return (
    <div className="border rounded-md flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        {icon}
      </div>
      <p>{message}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}
