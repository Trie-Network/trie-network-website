import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui';
import { getNetworkColor, getNetworkHoverColor, NETWORK_COLORS } from '../../config/colors';

interface PartnerRequestState {
  isSubmitting: boolean;
  showSuccessModal: boolean;
}

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
}


const ANIMATION_DURATION = 2000;

const ICON_STYLES = {
  container: `w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`,
  svg: 'w-10 h-10',
  success: 'w-6 h-6 text-green-600'
} as const;

const BUTTON_STYLES = {
  primary: `inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2`,
  secondary: `inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2`,
  modal: `inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-lg`
} as const;

const CONTENT_STYLES = {
  container: 'h-[calc(100vh-112px)] flex items-center justify-center px-4',
  wrapper: 'w-full max-w-xl text-center',
  title: 'text-3xl font-bold text-gray-900 mb-4',
  description: 'text-lg text-gray-600 mb-8',
  buttonGroup: 'space-x-4',
  modalContent: 'p-6 text-center',
  successIcon: 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4',
  modalTitle: 'text-lg font-medium text-gray-900 mb-2',
  modalDescription: 'text-sm text-gray-600 mb-6'
} as const;


const getIconBackgroundColor = (): React.CSSProperties => ({
  backgroundColor: `rgba(${NETWORK_COLORS.primaryRgb}, 0.1)`
});

const getPrimaryButtonStyle = (isSubmitting: boolean): React.CSSProperties => ({
  backgroundColor: getNetworkColor(),
  '--tw-ring-color': getNetworkColor()
} as React.CSSProperties);

const getSecondaryButtonStyle = (): React.CSSProperties => ({
  '--tw-ring-color': getNetworkColor()
} as React.CSSProperties);

const getModalButtonStyle = (): React.CSSProperties => ({
  backgroundColor: getNetworkColor()
});

const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isSubmitting: boolean) => {
  if (!isSubmitting) {
    e.currentTarget.style.backgroundColor = getNetworkHoverColor();
  }
};

const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>, isSubmitting: boolean) => {
  if (!isSubmitting) {
    e.currentTarget.style.backgroundColor = getNetworkColor();
  }
};

const handleModalButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = getNetworkHoverColor();
};

const handleModalButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = getNetworkColor();
};


const PartnerIcon = () => (
  <div className={ICON_STYLES.container} style={getIconBackgroundColor()}>
    <svg className={ICON_STYLES.svg} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: getNetworkColor() }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  </div>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className={ICON_STYLES.success} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const PrimaryButton = ({ onClick, disabled, children }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${BUTTON_STYLES.primary} ${disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
    style={getPrimaryButtonStyle(disabled || false)}
    onMouseEnter={(e) => handleButtonHover(e, disabled || false)}
    onMouseLeave={(e) => handleButtonLeave(e, disabled || false)}
  >
    {children}
  </button>
);

const SecondaryButton = ({ onClick, children }: ButtonProps) => (
  <button
    onClick={onClick}
    className={BUTTON_STYLES.secondary}
    style={getSecondaryButtonStyle()}
  >
    {children}
  </button>
);

const ModalButton = ({ onClick, children }: ButtonProps) => (
  <button
    onClick={onClick}
    className={BUTTON_STYLES.modal}
    style={getModalButtonStyle()}
    onMouseEnter={handleModalButtonHover}
    onMouseLeave={handleModalButtonLeave}
  >
    {children}
  </button>
);

const SuccessModal = ({ show, onClose, onNavigateHome }: SuccessModalProps) => (
  <Modal
    show={show}
    onClose={onClose}
    title="Request Received"
  >
    <div className={CONTENT_STYLES.modalContent}>
      <div className={CONTENT_STYLES.successIcon}>
        <SuccessIcon />
      </div>
      <h3 className={CONTENT_STYLES.modalTitle}>Thank You!</h3>
      <p className={CONTENT_STYLES.modalDescription}>
        We've received your request. We'll notify you as soon as the partner program launches.
      </p>
      <ModalButton onClick={onNavigateHome}>
        Back to Home
      </ModalButton>
    </div>
  </Modal>
);


export function BecomePartnerView() {
  const [state, setState] = useState<PartnerRequestState>({
    isSubmitting: false,
    showSuccessModal: false
  });
  const navigate = useNavigate();

  const handlePartnerRequest = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
      
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION));
    
    setState(prev => ({ 
      isSubmitting: false, 
      showSuccessModal: true 
    }));
  };

  const handleNavigateHome = () => {
    setState(prev => ({ ...prev, showSuccessModal: false }));
    navigate('/dashboard/all');
  };

  const handleCloseModal = () => {
    setState(prev => ({ ...prev, showSuccessModal: false }));
  };

  return (
    <div className={CONTENT_STYLES.container}>
      <div className={CONTENT_STYLES.wrapper}>
        <PartnerIcon />
        <h1 className={CONTENT_STYLES.title}>Coming Soon</h1>
        <p className={CONTENT_STYLES.description}>
          The partner program is currently under development. Stay tuned for updates!
        </p>
        <div className={CONTENT_STYLES.buttonGroup}>
          <PrimaryButton onClick={handlePartnerRequest} disabled={state.isSubmitting}>
            {state.isSubmitting ? (
              <>
                <LoadingSpinner />
                Processing...
              </>
            ) : (
              'Get Notified'
            )}
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/dashboard/all')}>
            Back to Home
          </SecondaryButton>
        </div>
      </div>

      <SuccessModal
        show={state.showSuccessModal}
        onClose={handleCloseModal}
        onNavigateHome={handleNavigateHome}
      />
    </div>
  );
}