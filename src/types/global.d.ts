
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
  
  // Additional React types needed for UI components
  export type ElementRef<T = any> = any;
  export type ComponentPropsWithoutRef<T = any> = any;
  export type HTMLAttributes<T = any> = any;
  export type ButtonHTMLAttributes<T = any> = any;
  export type RefAttributes<T = any> = any;
  export type ThHTMLAttributes<T = any> = any;
  export type TdHTMLAttributes<T = any> = any;
  export type ComponentType<T = any> = any;
  export namespace React {
    type FC<P = {}> = FunctionComponent<P>;
    interface FunctionComponent<P = {}> {
      (props: P, context?: any): ReactElement<any, any> | null;
      displayName?: string;
    }
  }
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
  export const EyeOff: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const MoreHorizontal: React.FC<IconProps>;
  export const Circle: React.FC<IconProps>;
  export const ChevronUp: React.FC<IconProps>;
}

// Type declarations for shadcn/ui component libraries
declare module '@radix-ui/react-accordion' {
  export const Root: any;
  export const Item: any;
  export const Header: any;
  export const Trigger: any;
  export const Content: any;
}

declare module '@radix-ui/react-alert-dialog' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Action: any;
  export const Cancel: any;
}

declare module '@radix-ui/react-aspect-ratio' {
  export const Root: any;
}

declare module '@radix-ui/react-avatar' {
  export const Root: any;
  export const Image: any;
  export const Fallback: any;
}

declare module '@radix-ui/react-dialog' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Close: any;
}

declare module '@radix-ui/react-popover' {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Content: any;
}

declare module '@radix-ui/react-progress' {
  export const Root: any;
  export const Indicator: any;
}

declare module '@radix-ui/react-radio-group' {
  export const Root: any;
  export const Item: any;
  export const Indicator: any;
}

declare module '@radix-ui/react-scroll-area' {
  export const Root: any;
  export const Viewport: any;
  export const ScrollAreaScrollbar: any;
  export const ScrollAreaThumb: any;
  export const Corner: any;
}

declare module '@radix-ui/react-select' {
  export const Root: any;
  export const Group: any;
  export const Value: any;
  export const Trigger: any;
  export const Content: any;
  export const Viewport: any;
  export const Label: any;
  export const Item: any;
  export const ItemText: any;
  export const ItemIndicator: any;
  export const ScrollUpButton: any;
  export const ScrollDownButton: any;
  export const Separator: any;
}

declare module '@radix-ui/react-separator' {
  export const Root: any;
}

declare module '@radix-ui/react-slider' {
  export const Root: any;
  export const Track: any;
  export const Range: any;
  export const Thumb: any;
}

declare module '@radix-ui/react-slot' {
  export const Slot: any;
}

declare module '@radix-ui/react-switch' {
  export const Root: any;
  export const Thumb: any;
}

declare module '@radix-ui/react-tabs' {
  export const Root: any;
  export const List: any;
  export const Trigger: any;
  export const Content: any;
}

declare module '@radix-ui/react-toast' {
  export const Provider: any;
  export const Root: any;
  export const Title: any;
  export const Description: any;
  export const Action: any;
  export const Close: any;
  export const Viewport: any;
}

declare module '@radix-ui/react-toggle' {
  export const Root: any;
}

declare module '@radix-ui/react-toggle-group' {
  export const Root: any;
  export const Item: any;
}

declare module '@radix-ui/react-tooltip' {
  export const Provider: any;
  export const Root: any;
  export const Trigger: any;
  export const Content: any;
}

declare module 'class-variance-authority' {
  export function cva(base: string, config: any): any;
  export type VariantProps<T> = any;
}

declare module 'react-resizable-panels' {
  export const PanelGroup: any;
  export const Panel: any;
  export const PanelResizeHandle: any;
}

declare module 'next-themes' {
  export const useTheme: () => {
    theme: string;
    setTheme: (theme: string) => void;
  };
}
