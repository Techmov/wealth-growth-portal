
import { ReactNode } from "react";

interface HeadingProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function Heading({ title, description, icon }: HeadingProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {icon && (
        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
