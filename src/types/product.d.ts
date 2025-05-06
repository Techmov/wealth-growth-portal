
// Extend the Product interface to include the active property
import { Product } from '@/types';

declare module '@/types' {
  interface Product {
    active: boolean;
  }
}
