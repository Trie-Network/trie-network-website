
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface BackdropProps {
  onClose: () => void;
  className?: string;
}

interface HeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

interface CloseButtonProps {
  onClose: () => void;
  className?: string;
}

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

const BACKDROP_ANIMATION_CONFIG = {
  enter: "transition-opacity ease-linear duration-300",
  enterFrom: "opacity-0",
  enterTo: "opacity-100",
  leave: "transition-opacity ease-linear duration-300",
  leaveFrom: "opacity-100",
  leaveTo: "opacity-0"
} as const;

const DRAWER_ANIMATION_CONFIG = {
  enter: "transition ease-in-out duration-300 transform",
  enterFrom: "translate-x-full",
  enterTo: "translate-x-0",
  leave: "transition ease-in-out duration-300 transform",
  leaveFrom: "translate-x-0",
  leaveTo: "translate-x-full"
} as const;

const MOBILE_FILTER_DRAWER_CLASSES = {
  dialog: 'relative z-50 lg:hidden',
  backdrop: 'fixed inset-0 bg-black bg-opacity-25',
  container: 'fixed inset-0 z-40 flex',
  panel: 'relative ml-auto flex h-full w-full max-w-xs flex-col bg-white pb-12 shadow-xl',
  header: 'flex items-center justify-between px-4 py-4 border-b border-gray-200',
  title: 'text-lg font-medium text-gray-900',
  closeButton: '-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-50',
  closeIcon: 'h-6 w-6',
  content: 'p-4 overflow-y-auto'
} as const;

const MOBILE_FILTER_DRAWER_DEFAULT_CONFIG = {
  defaultTitle: 'Filters',
  defaultClassName: '',
  screenReaderText: 'Close menu'
} as const;

const mobileFilterDrawerUtils = {
  getDialogClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.dialog} ${className}`.trim();
  },

  getBackdropClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.backdrop} ${className}`.trim();
  },

  getPanelClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.panel} ${className}`.trim();
  },

  getHeaderClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.header} ${className}`.trim();
  },

  getTitleClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.title} ${className}`.trim();
  },

  getCloseButtonClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.closeButton} ${className}`.trim();
  },

  getContentClasses: (className: string): string => {
    return `${MOBILE_FILTER_DRAWER_CLASSES.content} ${className}`.trim();
  },

  validateProps: (props: MobileFilterDrawerProps): boolean => {
    return (
      typeof props.isOpen === 'boolean' &&
      typeof props.onClose === 'function' &&
      (props.title === undefined || typeof props.title === 'string') &&
      props.children !== undefined &&
      (props.className === undefined || typeof props.className === 'string')
    );
  },

  getDefaultTitle: (title?: string): string => {
    return title || MOBILE_FILTER_DRAWER_DEFAULT_CONFIG.defaultTitle;
  }
} as const;


const Backdrop: React.FC<BackdropProps> = ({ onClose, className = '' }) => (
  <Transition.Child
    as={Fragment}
    enter={BACKDROP_ANIMATION_CONFIG.enter}
    enterFrom={BACKDROP_ANIMATION_CONFIG.enterFrom}
    enterTo={BACKDROP_ANIMATION_CONFIG.enterTo}
    leave={BACKDROP_ANIMATION_CONFIG.leave}
    leaveFrom={BACKDROP_ANIMATION_CONFIG.leaveFrom}
    leaveTo={BACKDROP_ANIMATION_CONFIG.leaveTo}
  >
    <div className={mobileFilterDrawerUtils.getBackdropClasses(className)} />
  </Transition.Child>
);

const CloseButton: React.FC<CloseButtonProps> = ({ onClose, className = '' }) => (
  <button
    type="button"
    className={mobileFilterDrawerUtils.getCloseButtonClasses(className)}
    onClick={onClose}
  >
    <span className="sr-only">{MOBILE_FILTER_DRAWER_DEFAULT_CONFIG.screenReaderText}</span>
    <svg 
      className={MOBILE_FILTER_DRAWER_CLASSES.closeIcon} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  </button>
);

const Header: React.FC<HeaderProps> = ({ title, onClose, className = '' }) => (
  <div className={mobileFilterDrawerUtils.getHeaderClasses(className)}>
    <h2 className={mobileFilterDrawerUtils.getTitleClasses('')}>
      {title}
    </h2>
    <CloseButton onClose={onClose} />
  </div>
);

const Content: React.FC<ContentProps> = ({ children, className = '' }) => (
  <div className={mobileFilterDrawerUtils.getContentClasses(className)}>
    {children}
  </div>
);


export function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  title = MOBILE_FILTER_DRAWER_DEFAULT_CONFIG.defaultTitle,
  children,
  className = MOBILE_FILTER_DRAWER_DEFAULT_CONFIG.defaultClassName
}: MobileFilterDrawerProps) {

  if (!mobileFilterDrawerUtils.validateProps({ isOpen, onClose, title, children, className })) {
   
    return null;
  }

  const displayTitle = mobileFilterDrawerUtils.getDefaultTitle(title);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className={mobileFilterDrawerUtils.getDialogClasses(className)} 
        onClose={onClose}
      >
        <Backdrop onClose={onClose} />

        <div className={MOBILE_FILTER_DRAWER_CLASSES.container}>
          <Transition.Child
            as={Fragment}
            enter={DRAWER_ANIMATION_CONFIG.enter}
            enterFrom={DRAWER_ANIMATION_CONFIG.enterFrom}
            enterTo={DRAWER_ANIMATION_CONFIG.enterTo}
            leave={DRAWER_ANIMATION_CONFIG.leave}
            leaveFrom={DRAWER_ANIMATION_CONFIG.leaveFrom}
            leaveTo={DRAWER_ANIMATION_CONFIG.leaveTo}
          >
            <Dialog.Panel className={mobileFilterDrawerUtils.getPanelClasses('')}>
              <Header title={displayTitle} onClose={onClose} />
              <Content>{children}</Content>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}


export type { 
  MobileFilterDrawerProps, 
  BackdropProps, 
  HeaderProps, 
  CloseButtonProps, 
  ContentProps 
};


export { 
  MOBILE_FILTER_DRAWER_CLASSES, 
  MOBILE_FILTER_DRAWER_DEFAULT_CONFIG, 
  BACKDROP_ANIMATION_CONFIG, 
  DRAWER_ANIMATION_CONFIG, 
  mobileFilterDrawerUtils 
};