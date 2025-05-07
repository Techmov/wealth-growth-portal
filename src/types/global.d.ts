
// This file contains global type definitions

import { LucideProps } from 'lucide-react';

// Add className support to all Lucide icons
declare module 'lucide-react' {
  interface IconProps extends LucideProps {
    className?: string;
  }
}

// Ensure React namespace is available globally
import React from 'react';
declare global {
  namespace React {}
}

// Fix for module not found errors
declare module 'react' {}
declare module 'react-router-dom' {}
declare module 'date-fns' {}
declare module 'sonner' {}
declare module 'lucide-react' {}
declare module 'react/jsx-runtime' {}
declare module '@radix-ui/react-accordion' {}
declare module '@radix-ui/react-alert-dialog' {}
declare module '@radix-ui/react-aspect-ratio' {}
declare module '@radix-ui/react-avatar' {}
declare module '@radix-ui/react-slot' {}
declare module 'class-variance-authority' {}
