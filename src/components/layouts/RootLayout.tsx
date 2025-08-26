import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TopNavbar } from '../dashboard';
import { NetworkBanner } from '../ui/NetworkBanner';


export interface RootLayoutProps {
  className?: string;
}

interface NavigationHeaderProps {
  showHeader: boolean;
}

interface ScrollToTopProps {
  pathname: string;
}


const EXCLUDED_PATHS = ['/faucet'] as const;
const SCROLL_POSITION = { x: 0, y: 0 };

const ANIMATION_CONFIG = {
  scroll: 'smooth' as ScrollBehavior
} as const;

const LAYOUT_CLASSES = {
  container: 'min-h-screen',
  header: 'fixed top-0 left-0 right-0 z-50'
} as const;


const normalizePath = (pathname: string): string => {
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const shouldShowHeader = (normalizedPath: string): boolean => {
  return !EXCLUDED_PATHS.includes(normalizedPath as any);
};

const scrollToTop = (): void => {
  window.scrollTo({
    top: SCROLL_POSITION.y,
    left: SCROLL_POSITION.x,
    behavior: ANIMATION_CONFIG.scroll
  });
};

const useScrollToTop = (pathname: string): void => {
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
};


const ScrollToTop: React.FC<ScrollToTopProps> = ({ pathname }) => {
  useScrollToTop(pathname);
  return null;
};

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ showHeader }) => {
  if (!showHeader) return null;

  return (
    <div className={LAYOUT_CLASSES.header}>
      <NetworkBanner />
      <TopNavbar />
    </div>
  );
};


export function RootLayout({ className }: RootLayoutProps = {}) {
  const location = useLocation();
  const normalizedPath = normalizePath(location.pathname);
  const showHeader = shouldShowHeader(normalizedPath);

  return (
    <div className={`${LAYOUT_CLASSES.container} ${className || ''}`}>
      <ScrollToTop pathname={location.pathname} />
      
      <NavigationHeader showHeader={showHeader} />
      
      <Outlet />
    </div>
  );
}