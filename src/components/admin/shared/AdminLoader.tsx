
import React from "react";

export function AdminLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
