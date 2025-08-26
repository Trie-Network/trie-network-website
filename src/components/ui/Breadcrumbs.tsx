
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';


interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showSteps?: boolean;
  currentStep?: number; 
  totalSteps?: number; 
}

interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  index: number;
  isActive: boolean;
  isHome: boolean;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

interface BreadcrumbSeparatorProps {
  isVisible: boolean;
}


const LAYOUT_CLASSES = {
  container: 'flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-[#e1e3e5] shadow-sm',
  breadcrumbList: 'flex items-center space-x-1 min-w-0 flex-1',
  breadcrumbItem: 'flex items-center',
  breadcrumbItemHome: 'flex-shrink-0',
  breadcrumbItemOther: 'min-w-0',
  separator: 'mx-2 text-gray-400',
  link: 'text-sm font-medium rounded-md px-2 py-1 transition-colors truncate block',
  linkActive: 'text-[#0284a5] bg-[#0284a5]/5',
  linkInactive: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
  linkTruncate: 'truncate block',
  text: 'text-sm font-semibold text-gray-900 px-2 py-1',
  textTruncate: 'truncate block',
  stepContainer: 'ml-4 flex-shrink-0',
  stepText: 'text-xs text-gray-500'
} as const;

const ANIMATION_CONFIG = {
  hover: {
    scale: 1.02
  },
  tap: {
    scale: 0.98
  }
} as const;

const ACCESSIBILITY_CONFIG = {
  navLabel: 'Breadcrumb'
} as const;


const breadcrumbUtils = {
  
  isHomeItem: (index: number): boolean => {
    return index === 0;
  },

  
  isActiveItem: (itemHref: string | undefined, currentPath: string): boolean => {
    return itemHref === currentPath;
  },

  
  getBreadcrumbItemClasses: (isHome: boolean): string => {
    return `${LAYOUT_CLASSES.breadcrumbItem} ${
      isHome ? LAYOUT_CLASSES.breadcrumbItemHome : LAYOUT_CLASSES.breadcrumbItemOther
    }`;
  },

  
  getLinkClasses: (isActive: boolean, isHome: boolean): string => {
    const baseClasses = LAYOUT_CLASSES.link;
    const stateClasses = isActive ? LAYOUT_CLASSES.linkActive : LAYOUT_CLASSES.linkInactive;
    const truncateClasses = !isHome ? LAYOUT_CLASSES.linkTruncate : '';
    
    return `${baseClasses} ${stateClasses} ${truncateClasses}`.trim();
  },

  
  getTextClasses: (isHome: boolean): string => {
    const baseClasses = LAYOUT_CLASSES.text;
    const truncateClasses = !isHome ? LAYOUT_CLASSES.textTruncate : '';
    
    return `${baseClasses} ${truncateClasses}`.trim();
  },

  
  validateItems: (items: BreadcrumbItem[]): boolean => {
    return Array.isArray(items) && items.length > 0 && items.every(item => 
      typeof item.label === 'string' && item.label.trim() !== ''
    );
  },

  
  validateSteps: (currentStep?: number, totalSteps?: number): boolean => {
    if (currentStep === undefined || totalSteps === undefined) return false;
    return currentStep > 0 && totalSteps > 0 && currentStep <= totalSteps;
  }
} as const;


const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className={LAYOUT_CLASSES.separator}>
      /
    </div>
  );
};

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ item, index, isActive, isHome }) => {
  const itemClasses = breadcrumbUtils.getBreadcrumbItemClasses(isHome);
  const showSeparator = index > 0;

  return (
    <li key={item.label} className={itemClasses}>
      <BreadcrumbSeparator isVisible={showSeparator} />
      
      {item.href ? (
        <motion.div
          whileHover={ANIMATION_CONFIG.hover}
          whileTap={ANIMATION_CONFIG.tap}
          className={isHome ? '' : 'min-w-0'}
        >
          <Link
            to={item.href}
            className={breadcrumbUtils.getLinkClasses(isActive, isHome)}
          >
            {item.label}
          </Link>
        </motion.div>
      ) : (
        <span className={breadcrumbUtils.getTextClasses(isHome)}>
          {item.label}
        </span>
      )}
    </li>
  );
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  if (!breadcrumbUtils.validateSteps(currentStep, totalSteps)) {
    return null;
  }

  return (
    <div className={LAYOUT_CLASSES.stepContainer}>
      <div className={LAYOUT_CLASSES.stepText}>
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};


export function Breadcrumbs({ 
  items, 
  showSteps = false, 
  currentStep, 
  totalSteps 
}: BreadcrumbsProps) {
  const location = useLocation();

  
  if (!breadcrumbUtils.validateItems(items)) {
  
    return null;
  }

  return (
    <nav 
      className={LAYOUT_CLASSES.container} 
      aria-label={ACCESSIBILITY_CONFIG.navLabel}
    >
      <ol className={LAYOUT_CLASSES.breadcrumbList}>
        {items.map((item, index) => {
          const isHome = breadcrumbUtils.isHomeItem(index);
          const isActive = breadcrumbUtils.isActiveItem(item.href, location.pathname);
          
          return (
            <BreadcrumbItem
              key={item.label}
              item={item}
              index={index}
              isActive={isActive}
              isHome={isHome}
            />
          );
        })}
      </ol>
      
      {showSteps && (
        <StepIndicator 
          currentStep={currentStep!} 
          totalSteps={totalSteps!} 
        />
      )}
    </nav>
  );
}


export type { 
  BreadcrumbsProps, 
  BreadcrumbItem, 
  BreadcrumbItemProps, 
  StepIndicatorProps,
  BreadcrumbSeparatorProps
};


export { ANIMATION_CONFIG, ACCESSIBILITY_CONFIG, breadcrumbUtils };