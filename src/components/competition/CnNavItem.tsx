import { motion } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCompTheme } from '@/contexts/compTheme';
import { getCompetitionTheme } from '@/config/competitions';

    
export interface NavItem {
    id: string;
    label: string;
    icon: string;
    route?: string;
}

export interface NavItemProps {
    item: NavItem;
    isMobile?: boolean;
    badge?: React.ReactNode;
}


const ANIMATION_VARIANTS = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
} as const;

const ICON_CLASSES = {
    mobile: 'w-5 h-5 mb-1 transition-transform group-hover:translate-x-0.5',
    desktop: 'w-5 h-5 mr-2.5 transition-transform group-hover:translate-x-0.5'
} as const;

const BASE_BUTTON_CLASSES = 'flex items-center text-sm font-medium rounded-lg transition-all duration-200 group';


const getButtonClasses = (isMobile: boolean, isActive: boolean): string => {
    const layoutClasses = isMobile 
        ? 'flex-col items-center justify-center p-2'
        : 'w-full px-3 py-2';
    
    const stateClasses = isActive
        ? 'bg-white shadow-sm border border-gray-100'
        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border hover:border-gray-100';
    
    return `${BASE_BUTTON_CLASSES} ${layoutClasses} ${stateClasses}`;
};

const getIconClasses = (isMobile: boolean): string => {
    return isMobile ? ICON_CLASSES.mobile : ICON_CLASSES.desktop;
};

const getLabelClasses = (isMobile: boolean): string => {
    return isMobile ? 'text-xs' : '';
};

const normalizePath = (pathname: string): string => {
    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const getCurrentPath = (pathname: string): string => {
    const normalizedPath = normalizePath(pathname);
    return normalizedPath.split('/').pop() || 'all';
};

const handleNavigation = (navigate: any, item: NavItem): void => {
    navigate(item.route || `/competition/${item.id}`);
    
        
    const event = new CustomEvent('closeModals');
    window.dispatchEvent(event);
};


export function CnNavItem({ item, isMobile = false, badge }: NavItemProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { primaryColor } = useCompTheme();
    const { compid = 'default' } = useParams();


    const compTheme = getCompetitionTheme(compid);


    const currentPath = getCurrentPath(location.pathname);
    const isActive = currentPath === item.id;


    const buttonClasses = getButtonClasses(isMobile, isActive);
    const iconClasses = getIconClasses(isMobile);
    const labelClasses = getLabelClasses(isMobile);
    const activeStyle = isActive ? { color: primaryColor } : {};

    return (
        <motion.button
            whileHover={ANIMATION_VARIANTS.hover}
            whileTap={ANIMATION_VARIANTS.tap}
            onClick={() => handleNavigation(navigate, item)}
            style={activeStyle}
            className={buttonClasses}
        >
            <svg
                className={iconClasses}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d={item.icon} 
                />
            </svg>
            
            <div className="flex items-center">
                <span className={labelClasses}>
                    {item.label}
                </span>
                {badge && badge}
            </div>
        </motion.button>
    );
}