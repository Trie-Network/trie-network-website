import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompTheme } from '@/contexts/compTheme';

export interface NavItemProps {
  item: {
    id: string;
    label: string;
    icon: string;
    route?: string;
  };
  isMobile?: boolean;
  badge?: React.ReactNode;
  baseRoute?: string;
}

export function NavItem({ item, isMobile = false, badge, baseRoute = '/dashboard' }: NavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor } = useCompTheme();
  const normalizedPath = location.pathname.endsWith('/')
    ? location.pathname.slice(0, -1)
    : location.pathname;
  const currentPath = normalizedPath.split('/').pop() || 'all';
  const isActive = currentPath === item.id;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        navigate(item.route || `${baseRoute}/${item.id}`);
        window.dispatchEvent(new CustomEvent('closeModals'));
      }}
      style={isActive ? { color: primaryColor } : {}}
      className={`flex items-center text-sm font-medium rounded-lg transition-all duration-200 group ${
        isMobile
          ? 'flex-col items-center justify-center p-2'
          : 'w-full px-3 py-2'
      } ${
        isActive
          ? 'bg-white shadow-sm border border-gray-100'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
      }`}
    >
      <svg
        className={`w-5 h-5 ${isMobile ? 'mb-1' : 'mr-2.5'} transition-transform group-hover:translate-x-0.5`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
      </svg>
      <div className="flex items-center">
        <span className={isMobile ? 'text-xs' : ''}>{item.label}</span>
        {badge}
      </div>
    </motion.button>
  );
}