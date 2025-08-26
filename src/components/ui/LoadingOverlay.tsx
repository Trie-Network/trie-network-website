

import { motion } from 'framer-motion';


interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface MessageProps {
  message: string;
  className?: string;
}


const OVERLAY_ANIMATION_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as const;

const SPINNER_ANIMATION_CONFIG = {
  duration: 1,
  repeat: Infinity,
  ease: "linear"
} as const;


const LOADING_OVERLAY_CLASSES = {
  overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
  container: 'bg-white rounded-xl p-8 flex flex-col items-center max-w-sm mx-4',
  spinner: {
    container: 'w-12 h-12 mb-4',
    svg: 'animate-spin w-full h-full text-[#0284a5]',
    circle: 'opacity-25',
    path: 'opacity-75'
  },
  message: 'text-gray-900 font-medium text-center'
} as const;

const LOADING_OVERLAY_DEFAULT_CONFIG = {
  defaultMessage: 'Uploading...',
  defaultClassName: '',
  spinnerSizes: {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
} as const;


const loadingOverlayUtils = {

  getSpinnerSizeClasses: (size: SpinnerProps['size'] = 'md'): string => {
    return LOADING_OVERLAY_DEFAULT_CONFIG.spinnerSizes[size];
  },


  getOverlayClasses: (className: string): string => {
    return `${LOADING_OVERLAY_CLASSES.overlay} ${className}`.trim();
  },


  getContainerClasses: (className: string): string => {
    return `${LOADING_OVERLAY_CLASSES.container} ${className}`.trim();
  },


  getMessageClasses: (className: string): string => {
    return `${LOADING_OVERLAY_CLASSES.message} ${className}`.trim();
  },


  validateProps: (props: LoadingOverlayProps): boolean => {
    return (
      (props.message === undefined || typeof props.message === 'string') &&
      (props.className === undefined || typeof props.className === 'string')
    );
  },


  getDefaultMessage: (message?: string): string => {
    return message || LOADING_OVERLAY_DEFAULT_CONFIG.defaultMessage;
  }
} as const;


const Spinner: React.FC<SpinnerProps> = ({ className = '', size = 'md' }) => (
  <div className={`${loadingOverlayUtils.getSpinnerSizeClasses(size)} ${className}`}>
    <svg 
      className={LOADING_OVERLAY_CLASSES.spinner.svg} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className={LOADING_OVERLAY_CLASSES.spinner.circle} 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className={LOADING_OVERLAY_CLASSES.spinner.path} 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  </div>
);

const Message: React.FC<MessageProps> = ({ message, className = '' }) => (
  <p className={loadingOverlayUtils.getMessageClasses(className)}>
    {message}
  </p>
);


export function LoadingOverlay({ 
  message = LOADING_OVERLAY_DEFAULT_CONFIG.defaultMessage,
  className = LOADING_OVERLAY_DEFAULT_CONFIG.defaultClassName
}: LoadingOverlayProps) {

  if (!loadingOverlayUtils.validateProps({ message, className })) {
  
    return null;
  }

  const displayMessage = loadingOverlayUtils.getDefaultMessage(message);

  return (
    <motion.div
      initial={OVERLAY_ANIMATION_VARIANTS.initial}
      animate={OVERLAY_ANIMATION_VARIANTS.animate}
      exit={OVERLAY_ANIMATION_VARIANTS.exit}
      className={loadingOverlayUtils.getOverlayClasses(className)}
    >
      <div className={loadingOverlayUtils.getContainerClasses('')}>
        <Spinner />
        <Message message={displayMessage} />
      </div>
    </motion.div>
  );
}

export type { LoadingOverlayProps, SpinnerProps, MessageProps };

export { 
  LOADING_OVERLAY_CLASSES, 
  LOADING_OVERLAY_DEFAULT_CONFIG, 
  OVERLAY_ANIMATION_VARIANTS, 
  SPINNER_ANIMATION_CONFIG, 
  loadingOverlayUtils 
};