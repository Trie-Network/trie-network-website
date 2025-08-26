
import { motion } from 'framer-motion';


interface ModalProps {
  show: boolean;
  onClose: () => void;
  onContinue?: () => void;
  preventOutsideClick?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface ModalBackdropProps {
  onClose: () => void;
  preventOutsideClick: boolean;
  className?: string;
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
}

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  onClose: () => void;
  onContinue: () => void;
  className?: string;
}

interface ContinueButtonProps {
  onClose: () => void;
  onContinue: () => void;
  className?: string;
}


const MODAL_ANIMATION_CONFIG = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.95, opacity: 0, y: 10 },
  transition: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
  }
} as const;


const MODAL_CLASSES = {
  backdrop: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
  container: 'bg-white rounded-2xl max-w-xl w-full max-h-[80vh] overflow-hidden shadow-2xl',
  header: 'px-6 py-4 flex justify-between items-center',
  title: 'text-xl font-semibold text-gray-900',
  closeButton: 'text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full',
  closeIcon: 'w-6 h-6',
  content: 'px-6 py-4 overflow-y-auto max-h-[60vh]',
  footer: 'px-6 py-4 border-t border-gray-200 flex justify-end',
  continueButton: 'px-6 py-2 bg-[#6366F1] text-white rounded-md hover:bg-[#5558E6] transition-colors'
} as const;

const MODAL_DEFAULT_CONFIG = {
  defaultPreventOutsideClick: false,
  defaultClassName: '',
  continueButtonText: 'Continue to Create Account'
} as const;


const modalUtils = {
  
  handleBackdropClick: (e: React.MouseEvent, onClose: () => void, preventOutsideClick: boolean): void => {
    if (e.target === e.currentTarget && !preventOutsideClick) {
      onClose();
    }
  },

  
  handleModalClick: (e: React.MouseEvent): void => {
    e.stopPropagation();
  },

  
  handleContinueClick: (onClose: () => void, onContinue: () => void): void => {
    onClose();
    onContinue();
  },

  
  getBackdropClasses: (className: string): string => {
    return `${MODAL_CLASSES.backdrop} ${className}`.trim();
  },

  
  getContainerClasses: (className: string): string => {
    return `${MODAL_CLASSES.container} ${className}`.trim();
  },

  
  getHeaderClasses: (className: string): string => {
    return `${MODAL_CLASSES.header} ${className}`.trim();
  },

  
  getTitleClasses: (className: string): string => {
    return `${MODAL_CLASSES.title} ${className}`.trim();
  },

  
  getCloseButtonClasses: (className: string): string => {
    return `${MODAL_CLASSES.closeButton} ${className}`.trim();
  },

  
  getContentClasses: (className: string): string => {
    return `${MODAL_CLASSES.content} ${className}`.trim();
  },

  
  getFooterClasses: (className: string): string => {
    return `${MODAL_CLASSES.footer} ${className}`.trim();
  },

  
  getContinueButtonClasses: (className: string): string => {
    return `${MODAL_CLASSES.continueButton} ${className}`.trim();
  },

  
  validateProps: (props: ModalProps): boolean => {
    return (
      typeof props.show === 'boolean' &&
      typeof props.onClose === 'function' &&
      (props.onContinue === undefined || typeof props.onContinue === 'function') &&
      (props.preventOutsideClick === undefined || typeof props.preventOutsideClick === 'boolean') &&
      typeof props.title === 'string' &&
      props.children !== undefined &&
      (props.className === undefined || typeof props.className === 'string')
    );
  }
} as const;


const ModalBackdrop: React.FC<ModalBackdropProps> = ({ onClose, preventOutsideClick, className = '' }) => (
  <div 
    className={modalUtils.getBackdropClasses(className)}
    onClick={(e) => modalUtils.handleBackdropClick(e, onClose, preventOutsideClick)}
  />
);

const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({ onClose, className = '' }) => (
  <button
    onClick={onClose}
    className={modalUtils.getCloseButtonClasses(className)}
  >
    <svg 
      className={MODAL_CLASSES.closeIcon} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
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

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, className = '' }) => (
  <div className={modalUtils.getHeaderClasses(className)}>
    <h2 className={modalUtils.getTitleClasses('')}>
      {title}
    </h2>
    <ModalCloseButton onClose={onClose} />
  </div>
);

const ModalContent: React.FC<ModalContentProps> = ({ children, className = '' }) => (
  <div className={modalUtils.getContentClasses(className)}>
    {children}
  </div>
);

const ModalContinueButton: React.FC<ContinueButtonProps> = ({ onClose, onContinue, className = '' }) => (
  <button
    onClick={() => modalUtils.handleContinueClick(onClose, onContinue)}
    className={modalUtils.getContinueButtonClasses(className)}
  >
    {MODAL_DEFAULT_CONFIG.continueButtonText}
  </button>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ onClose, onContinue, className = '' }) => (
  <div className={modalUtils.getFooterClasses(className)}>
    <ModalContinueButton onClose={onClose} onContinue={onContinue} />
  </div>
);


export function Modal({ 
  show, 
  onClose, 
  onContinue, 
  title, 
  children, 
  preventOutsideClick = MODAL_DEFAULT_CONFIG.defaultPreventOutsideClick,
  className = MODAL_DEFAULT_CONFIG.defaultClassName
}: ModalProps) {
  
  if (!modalUtils.validateProps({ show, onClose, onContinue, preventOutsideClick, title, children, className })) {
    
    return null;
  }

  
  if (!show) return null;

  return (
    <div className={modalUtils.getBackdropClasses('')} onClick={(e) => modalUtils.handleBackdropClick(e, onClose, preventOutsideClick)}>
      <motion.div
        initial={MODAL_ANIMATION_CONFIG.initial}
        animate={MODAL_ANIMATION_CONFIG.animate}
        exit={MODAL_ANIMATION_CONFIG.exit}
        transition={MODAL_ANIMATION_CONFIG.transition}
        onClick={modalUtils.handleModalClick}
        className={modalUtils.getContainerClasses(className)}
      >
        <ModalHeader title={title} onClose={onClose} />
        <ModalContent>{children}</ModalContent>
        {onContinue && (
          <ModalFooter onClose={onClose} onContinue={onContinue} />
        )}
      </motion.div>
    </div>
  );
}


export type { 
  ModalProps, 
  ModalBackdropProps, 
  ModalHeaderProps, 
  ModalCloseButtonProps, 
  ModalContentProps, 
  ModalFooterProps, 
  ContinueButtonProps 
};


export { 
  MODAL_CLASSES, 
  MODAL_DEFAULT_CONFIG, 
  MODAL_ANIMATION_CONFIG, 
  modalUtils 
};