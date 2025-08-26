import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompTheme } from '@/contexts/compTheme';


interface NavItemData {
  id: string;
  label: string;
  icon: string;
  route?: string;
}

interface NavItemBadge {
  label?: string;
}

export interface NavItemProps {
  item: NavItemData;
  isMobile?: boolean;
  badge?: React.ReactNode;
}

interface NavItemButtonProps {
  item: NavItemData;
  isActive: boolean;
  isMobile: boolean;
  primaryColor: string;
  onClick: () => void;
  children: React.ReactNode;
}

interface NavItemIconProps {
  icon: string;
  isMobile: boolean;
}

interface NavItemContentProps {
  label: string;
  isMobile: boolean;
  badge?: React.ReactNode;
}


const ANIMATION_VARIANTS = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
} as const;

const ICON_CLASSES = {
  base: 'w-5 h-5 transition-transform group-hover:translate-x-0.5',
  mobile: 'w-5 h-5 mb-1 transition-transform group-hover:translate-x-0.5',
  desktop: 'w-5 h-5 mr-2.5 transition-transform group-hover:translate-x-0.5'
} as const;

const BUTTON_CLASSES = {
  base: 'flex items-center text-sm font-medium rounded-lg transition-all duration-200 group',
  mobile: 'flex-col items-center justify-center p-2',
  desktop: 'w-full px-3 py-2',
  active: 'bg-white shadow-sm border border-gray-100',
  inactive: 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
} as const;

const LABEL_CLASSES = {
  mobile: 'text-xs',
  desktop: ''
} as const;

const CONTENT_CLASSES = {
  base: 'flex items-center'
} as const;


const normalizePath = (pathname: string): string => {
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const getCurrentPath = (pathname: string): string => {
  const normalizedPath = normalizePath(pathname);
  return normalizedPath.split('/').pop() || 'all';
};

const isItemActive = (currentPath: string, itemId: string): boolean => {
  return currentPath === itemId;
};

const getButtonClasses = (isMobile: boolean, isActive: boolean): string => {
  const baseClasses = BUTTON_CLASSES.base;
  const layoutClasses = isMobile ? BUTTON_CLASSES.mobile : BUTTON_CLASSES.desktop;
  const stateClasses = isActive ? BUTTON_CLASSES.active : BUTTON_CLASSES.inactive;
  
  return `${baseClasses} ${layoutClasses} ${stateClasses}`.trim();
};

const getIconClasses = (isMobile: boolean): string => {
  return isMobile ? ICON_CLASSES.mobile : ICON_CLASSES.desktop;
};

const getLabelClasses = (isMobile: boolean): string => {
  return isMobile ? LABEL_CLASSES.mobile : LABEL_CLASSES.desktop;
};

const handleNavigation = (item: NavItemData, navigate: any): void => {
  navigate(item.route || `/dashboard/${item.id}`);
  
  
  const event = new CustomEvent('closeModals');
  window.dispatchEvent(event);
};

const getActiveStyles = (isActive: boolean, primaryColor: string): React.CSSProperties => {
  return isActive ? { color: primaryColor } : {};
};

const NavItemIcon: React.FC<NavItemIconProps> = ({ icon, isMobile }) => {
  return (
    <svg
      className={getIconClasses(isMobile)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon} />
    </svg>
  );
};

const NavItemContent: React.FC<NavItemContentProps> = ({ label, isMobile, badge }) => {
  return (
    <div className={CONTENT_CLASSES.base}>
      <span className={getLabelClasses(isMobile)}>{label}</span>
      {badge && badge}
    </div>
  );
};

const NavItemButton: React.FC<NavItemButtonProps> = ({ 
  item, 
  isActive, 
  isMobile, 
  primaryColor, 
  onClick, 
  children 
}) => {
  return (
    <motion.button
      whileHover={ANIMATION_VARIANTS.hover}
      whileTap={ANIMATION_VARIANTS.tap}
      onClick={onClick}
      style={getActiveStyles(isActive, primaryColor)}
      className={getButtonClasses(isMobile, isActive)}
    >
      {children}
    </motion.button>
  );
};


export function NavItem({ item, isMobile = false, badge }: NavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { primaryColor } = useCompTheme();
  
  const currentPath = getCurrentPath(location.pathname);
  const isActive = isItemActive(currentPath, item.id);

  const handleClick = () => handleNavigation(item, navigate);

  return (
    <NavItemButton
      item={item}
      isActive={isActive}
      isMobile={isMobile}
      primaryColor={primaryColor}
      onClick={handleClick}
    >
      <NavItemIcon icon={item.icon} isMobile={isMobile} />
      <NavItemContent label={item.label} isMobile={isMobile} badge={badge} />
    </NavItemButton>
  );
}