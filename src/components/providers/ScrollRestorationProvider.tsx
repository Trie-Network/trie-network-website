import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollRestorationProviderProps {
  children: React.ReactNode;
}

export function ScrollRestorationProvider({ children }: ScrollRestorationProviderProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
}