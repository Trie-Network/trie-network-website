import { motion } from 'framer-motion';
import { useCallback, useEffect, ReactNode } from 'react';
import { componentStyles } from '@/utils';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  onContinue?: () => void;
  preventOutsideClick?: boolean;
  title: string;
  children: ReactNode;
  continueText?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg';
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
};

const MODAL_ANIMATIONS = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.95, opacity: 0, y: 10 },
  transition: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1]
  }
};

export function Modal({
  show,
  onClose,
  onContinue,
  title,
  children,
  preventOutsideClick = false,
  continueText = 'Continue to Create Account',
  maxWidth = 'xl'
}: ModalProps) {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventOutsideClick) {
      onClose();
    }
  }, [onClose, preventOutsideClick]);

  const handleContinue = useCallback(() => {
    onClose();
    onContinue?.();
  }, [onClose, onContinue]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={MODAL_ANIMATIONS.initial}
        animate={MODAL_ANIMATIONS.animate}
        exit={MODAL_ANIMATIONS.exit}
        transition={MODAL_ANIMATIONS.transition}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl ${MODAL_SIZES[maxWidth]} w-full max-h-[80vh] overflow-hidden shadow-2xl`}
      >
        <ModalHeader title={title} onClose={onClose} />
        <ModalContent>{children}</ModalContent>
        {onContinue && (
          <ModalFooter
            onContinue={handleContinue}
            continueText={continueText}
          />
        )}
      </motion.div>
    </div>
  );
}

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="px-6 py-4 flex justify-between items-center">
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
      aria-label="Close modal"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const ModalContent = ({ children }: { children: ReactNode }) => (
  <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
    {children}
  </div>
);

const ModalFooter = ({ onContinue, continueText }: {
  onContinue: () => void;
  continueText: string;
}) => (
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
    <button
      onClick={onContinue}
      className={componentStyles.button.primary}
    >
      {continueText}
    </button>
  </div>
);