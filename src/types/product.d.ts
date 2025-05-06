
import { Product as BaseProduct } from '@/types';

declare module '@/types' {
  interface Product extends BaseProduct {
    active: boolean;
  }
}
