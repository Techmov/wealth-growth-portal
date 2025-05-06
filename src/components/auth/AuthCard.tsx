
import { ReactNode } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
  error?: string;
}

export function AuthCard({ 
  title, 
  description, 
  footer, 
  children, 
  error
}: AuthCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        {children}
      </CardContent>
      
      {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
    </Card>
  );
}
