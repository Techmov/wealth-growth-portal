
// Type declarations for modules without TypeScript support
declare module 'react' {
  // React core exports
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useContext: any;
  export const createContext: any;
  export const memo: any;
  export const forwardRef: any;
  export const Fragment: any;
  export const Component: any;
  export type ReactNode = any;
  export type FormEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type MouseEvent<T = any> = any;
  export type SyntheticEvent<T = any> = any;
  export type FC<T = any> = any;
  export type ReactElement = any;
  export const createElement: any;
  export const cloneElement: any;
  export default React;
}

declare module 'react/jsx-runtime' {
  // JSX Runtime
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-router-dom' {
  // React Router DOM exports
  export const BrowserRouter: any;
  export const Route: any;
  export const Routes: any;
  export const Link: any;
  export const NavLink: any;
  export const Navigate: any;
  export const Outlet: any;
  export const useParams: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const useRouteMatch: any;
}

declare module 'date-fns' {
  // Date-fns exports
  export function formatDistanceToNow(date: Date | number, options?: any): string;
  export function format(date: Date | number, format: string, options?: any): string;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function parseISO(dateString: string): Date;
}

declare module 'sonner' {
  // Sonner toast exports
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
    promise: <T>(promise: Promise<T>, messages: any, options?: any) => Promise<T>;
    dismiss: () => void;
  };
  export const Toaster: any;
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
  export const ChevronDown: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Menu: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const LayoutDashboard: React.FC<IconProps>;
  export const PiggyBank: React.FC<IconProps>;
  export const Users2: React.FC<IconProps>;
  export const BarChart: React.FC<IconProps>;
  export const Edit: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const Trash2: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const Lock: React.FC<IconProps>;
}
