
// Type declarations for modules without TypeScript support
declare module 'react' {
  export * from 'react/index';
}

declare module 'react-router-dom' {
  export * from 'react-router-dom/index';
}

declare module 'date-fns' {
  export * from 'date-fns/index';
}

declare module 'sonner' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

declare module 'lucide-react' {
  import React from 'react';
  
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  export const Wallet: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;
  export const ArrowUp: React.FC<IconProps>;
  export const ArrowDown: React.FC<IconProps>;
  export const Copy: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const CreditCard: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
}
