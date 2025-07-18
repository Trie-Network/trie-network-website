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

export function Breadcrumbs({ items, showSteps = false, currentStep, totalSteps }: BreadcrumbsProps) {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 min-w-0 flex-1">
        {items.map((item, index) => {
          const isHome = index === 0;
          return (
          <li key={item.label} className={`flex items-center ${isHome ? 'flex-shrink-0' : 'min-w-0'}`}>
            {index > 0 && (
              <div className="mx-2 text-gray-400">/</div>
            )}
            {item.href ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={isHome ? '' : 'min-w-0'}
              >
                <Link
                  to={item.href}
                  className={`text-sm font-medium rounded-md px-2 py-1 transition-colors truncate block ${
                    location.pathname === item.href
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  } ${!isHome && 'truncate block'}`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ) : (
              <span className={`text-sm font-semibold text-gray-900 px-2 py-1 ${!isHome && 'truncate block'}`}>
                {item.label}
              </span>
            )}
          </li>
        )})}
      </ol>
      {showSteps && currentStep && totalSteps && (
        <div className="ml-4 flex-shrink-0">
          <div className="text-xs text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      )}
    </nav>
  );
}