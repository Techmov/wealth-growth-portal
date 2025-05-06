
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
