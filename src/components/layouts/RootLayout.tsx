import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TopNavbar } from '../dashboard';

export function RootLayout() {
  const location = useLocation();

  const normalizedPath = location.pathname.endsWith('/')
    ? location.pathname.slice(0, -1)
    : location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {normalizedPath !== "/faucet" && <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavbar />
      </div>}
      <Outlet />
    </div>
  );
}