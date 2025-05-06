
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
