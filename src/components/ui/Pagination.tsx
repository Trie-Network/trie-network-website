
import { motion } from 'framer-motion';
import { getNetworkColor } from '../../config/colors';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface DesktopPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  isPrevious?: boolean;
  isNext?: boolean;
}

interface PageNumberButtonProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

interface ResultsInfoProps {
  startIndex: number;
  endIndex: number;
  totalItems: number;
  className?: string;
}


const PAGINATION_CLASSES = {
  container: 'flex items-center justify-between bg-white rounded-xl border border-[#e1e3e5] px-6 py-4',
  mobileContainer: 'flex flex-1 justify-between sm:hidden',
  desktopContainer: 'hidden sm:flex sm:flex-1 sm:items-center sm:justify-between',
  resultsInfo: 'text-sm text-gray-700',
  nav: 'isolate inline-flex -space-x-px rounded-md shadow-sm',
  button: {
    base: 'relative inline-flex items-center text-sm font-medium transition-colors',
    mobile: 'rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
    desktop: 'ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
    previous: 'rounded-l-md px-2 py-2 text-gray-400',
    next: 'rounded-r-md px-2 py-2 text-gray-400',
    page: 'px-4 py-2 font-semibold',
    active: 'z-10 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    inactive: 'text-gray-900'
  },
  icon: 'h-5 w-5',
  srOnly: 'sr-only'
} as const;

const PAGINATION_DEFAULT_CONFIG = {
  defaultClassName: '',
  animationScale: {
    hover: 1.05,
    tap: 0.95
  },
  ariaLabels: {
    previous: 'Previous',
    next: 'Next',
    pagination: 'Pagination'
  }
} as const;

const PAGINATION_ANIMATION_CONFIG = {
  hover: { scale: PAGINATION_DEFAULT_CONFIG.animationScale.hover },
  tap: { scale: PAGINATION_DEFAULT_CONFIG.animationScale.tap }
} as const;


const paginationUtils = {

  getStartIndex: (currentPage: number, itemsPerPage: number): number => {
    return (currentPage - 1) * itemsPerPage;
  },


  getEndIndex: (currentPage: number, itemsPerPage: number, totalItems: number): number => {
    return Math.min(currentPage * itemsPerPage, totalItems);
  },


  getPreviousPage: (currentPage: number): number => {
    return Math.max(1, currentPage - 1);
  },


  getNextPage: (currentPage: number, totalPages: number): number => {
    return Math.min(totalPages, currentPage + 1);
  },


  createPageNumbers: (totalPages: number): number[] => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  },


  getContainerClasses: (className: string): string => {
    return `${PAGINATION_CLASSES.container} ${className}`.trim();
  },


  getMobileContainerClasses: (className: string): string => {
    return `${PAGINATION_CLASSES.mobileContainer} ${className}`.trim();
  },


  getDesktopContainerClasses: (className: string): string => {
    return `${PAGINATION_CLASSES.desktopContainer} ${className}`.trim();
  },


  getButtonClasses: (baseClass: string, additionalClass: string, className: string): string => {
    return `${baseClass} ${additionalClass} ${className}`.trim();
  },


  getPageButtonClasses: (isActive: boolean, className: string): string => {
    const baseClass = PAGINATION_CLASSES.button.page;
    const stateClass = isActive ? PAGINATION_CLASSES.button.active : PAGINATION_CLASSES.button.inactive;
    return `${baseClass} ${stateClass} ${className}`.trim();
  },


  validateProps: (props: PaginationProps): boolean => {
    return (
      typeof props.currentPage === 'number' && props.currentPage > 0 &&
      typeof props.totalPages === 'number' && props.totalPages > 0 &&
      typeof props.totalItems === 'number' && props.totalItems >= 0 &&
      typeof props.itemsPerPage === 'number' && props.itemsPerPage > 0 &&
      typeof props.onPageChange === 'function' &&
      (props.className === undefined || typeof props.className === 'string') &&
      props.currentPage <= props.totalPages
    );
  },


  handlePageChange: (page: number, totalPages: number, onPageChange: (page: number) => void): void => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }
} as const;


const PaginationButton: React.FC<PaginationButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  className = '',
  isActive = false,
  isPrevious = false,
  isNext = false
}) => {
  const baseClass = PAGINATION_CLASSES.button.base;
  const variantClass = isPrevious || isNext 
    ? PAGINATION_CLASSES.button.desktop 
    : PAGINATION_CLASSES.button.mobile;
  
  const positionClass = isPrevious 
    ? PAGINATION_CLASSES.button.previous 
    : isNext 
    ? PAGINATION_CLASSES.button.next 
    : '';

  const buttonClasses = paginationUtils.getButtonClasses(baseClass, variantClass, positionClass);

  return (
    <motion.button
      whileHover={PAGINATION_ANIMATION_CONFIG.hover}
      whileTap={PAGINATION_ANIMATION_CONFIG.tap}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClasses} ${className}`}
      style={isActive ? { backgroundColor: getNetworkColor(), outlineColor: getNetworkColor() } : {}}
    >
      {children}
    </motion.button>
  );
};

const PageNumberButton: React.FC<PageNumberButtonProps> = ({ 
  page, 
  isActive, 
  onClick, 
  className = '' 
}) => {
  const buttonClasses = paginationUtils.getPageButtonClasses(isActive, className);

  return (
    <motion.button
      whileHover={PAGINATION_ANIMATION_CONFIG.hover}
      whileTap={PAGINATION_ANIMATION_CONFIG.tap}
      onClick={onClick}
      className={buttonClasses}
      style={isActive ? { backgroundColor: getNetworkColor(), outlineColor: getNetworkColor() } : {}}
    >
      {page}
    </motion.button>
  );
};

const ResultsInfo: React.FC<ResultsInfoProps> = ({ 
  startIndex, 
  endIndex, 
  totalItems, 
  className = '' 
}) => (
  <div className={className}>
    <p className={PAGINATION_CLASSES.resultsInfo}>
      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
      <span className="font-medium">{endIndex}</span>{' '}
      of <span className="font-medium">{totalItems}</span> results
    </p>
  </div>
);

const MobilePagination: React.FC<MobilePaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) => (
  <div className={paginationUtils.getMobileContainerClasses(className)}>
    <PaginationButton
      onClick={() => paginationUtils.handlePageChange(
        paginationUtils.getPreviousPage(currentPage), 
        totalPages, 
        onPageChange
      )}
      disabled={currentPage === 1}
    >
      Previous
    </PaginationButton>
    <PaginationButton
      onClick={() => paginationUtils.handlePageChange(
        paginationUtils.getNextPage(currentPage, totalPages), 
        totalPages, 
        onPageChange
      )}
      disabled={currentPage === totalPages}
      className="ml-3"
    >
      Next
    </PaginationButton>
  </div>
);

const DesktopPagination: React.FC<DesktopPaginationProps> = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  className = '' 
}) => {
  const startIndex = paginationUtils.getStartIndex(currentPage, itemsPerPage);
  const endIndex = paginationUtils.getEndIndex(currentPage, itemsPerPage, totalItems);
  const pageNumbers = paginationUtils.createPageNumbers(totalPages);

  return (
    <div className={paginationUtils.getDesktopContainerClasses(className)}>
      <ResultsInfo 
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
      />
      <div>
        <nav className={PAGINATION_CLASSES.nav} aria-label={PAGINATION_DEFAULT_CONFIG.ariaLabels.pagination}>
          <PaginationButton
            isPrevious={true}
            onClick={() => paginationUtils.handlePageChange(
              paginationUtils.getPreviousPage(currentPage), 
              totalPages, 
              onPageChange
            )}
            disabled={currentPage === 1}
          >
            <span className={PAGINATION_CLASSES.srOnly}>{PAGINATION_DEFAULT_CONFIG.ariaLabels.previous}</span>
            <svg className={PAGINATION_CLASSES.icon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </PaginationButton>
          
          {pageNumbers.map((page) => (
            <PageNumberButton
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => paginationUtils.handlePageChange(page, totalPages, onPageChange)}
            />
          ))}
          
          <PaginationButton
            isNext={true}
            onClick={() => paginationUtils.handlePageChange(
              paginationUtils.getNextPage(currentPage, totalPages), 
              totalPages, 
              onPageChange
            )}
            disabled={currentPage === totalPages}
          >
            <span className={PAGINATION_CLASSES.srOnly}>{PAGINATION_DEFAULT_CONFIG.ariaLabels.next}</span>
            <svg className={PAGINATION_CLASSES.icon} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </PaginationButton>
        </nav>
      </div>
    </div>
  );
};


export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  className = PAGINATION_DEFAULT_CONFIG.defaultClassName
}: PaginationProps) {

  if (!paginationUtils.validateProps({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, className })) {
    
    return null;
  }

  return (
    <div className={paginationUtils.getContainerClasses(className)}>
      <MobilePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
      
      <DesktopPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}


export type { 
  PaginationProps, 
  MobilePaginationProps, 
  DesktopPaginationProps, 
  PaginationButtonProps, 
  PageNumberButtonProps, 
  ResultsInfoProps 
};


export { 
  PAGINATION_CLASSES, 
  PAGINATION_DEFAULT_CONFIG, 
  PAGINATION_ANIMATION_CONFIG, 
  paginationUtils 
};