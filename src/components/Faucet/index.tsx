import { END_POINTS } from '@/api/requests';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTokenName } from '@/contexts/TokenNameContext';


interface FaucetProps {
  className?: string;
}

interface FaucetFormProps {
  did: string;
  loading: boolean;
  tokenName: string;
  onDidChange: (value: string) => void;
  onSubmit: () => void;
}

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
  tokenName: string;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

interface WalletDetails {
  did: string;
  username?: string;
}


const MODAL_AUTO_CLOSE_DELAY = 5000; 
const FAUCET_TOKEN_COUNT = 10;
const STORAGE_KEY = 'wallet_details';

const ANIMATION_CONFIG = {
  spin: 'animate-spin',
  fadeIn: 'transition-opacity duration-300',
  fadeOut: 'transition-opacity duration-300'
} as const;

const LAYOUT_CLASSES = {
  container: 'min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4',
  wrapper: 'w-full max-w-[50%] mx-auto flex flex-col items-center gap-8',
  logo: 'w-32 h-auto object-contain',
  content: 'w-full',
  title: 'text-white text-3xl font-bold text-center mb-2 font-[\'IBM_Plex_Sans\']',
  subtitle: 'text-gray-400 text-center mb-8 font-[\'IBM_Plex_Sans\']',
  form: 'flex gap-4',
  input: 'flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors font-[\'IBM_Plex_Mono\']',
  submitButton: 'px-6 py-3 bg-white text-black font-semibold rounded-lg transition-colors flex items-center gap-2 font-[\'IBM_Plex_Sans\']',
  submitButtonDisabled: 'opacity-50 cursor-not-allowed',
  submitButtonEnabled: 'hover:bg-gray-200',
  loadingContainer: 'flex justify-center items-center',
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
  modalContainer: 'bg-gray-800 rounded-lg p-6 max-w-md w-full relative',
  modalCloseButton: 'absolute top-4 right-4 text-gray-400 hover:text-white',
  modalContent: 'text-center mb-6',
  successIcon: 'w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4',
  modalTitle: 'text-white text-xl font-bold font-[\'IBM_Plex_Sans\']',
  modalMessage: 'text-gray-300 mt-2 font-[\'IBM_Plex_Sans\']',
  modalButton: 'w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-[\'IBM_Plex_Sans\']'
} as const;

const LOADER_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
} as const;

const FONT_FAMILIES = {
  sans: 'font-[\'IBM_Plex_Sans\']',
  mono: 'font-[\'IBM_Plex_Mono\']'
} as const;


const getWalletDetailsFromStorage = (): WalletDetails | null => {
  try {
    const details = localStorage.getItem(STORAGE_KEY);
    return details ? JSON.parse(details) : null;
  } catch (error) {
    
    return null;
  }
};

const validateDid = (did: string): boolean => {
  return did.trim().length > 0;
};

const showSuccessToast = (message: string): void => {
  toast.success(message);
};

const showErrorToast = (message: string): void => {
  toast.error(message);
};

const simulateApiCall = async (username: string, ftCount: number): Promise<any> => {
  return await END_POINTS.request_ft({
    username,
    ftCount
  });
};

const clearInput = (setter: (value: string) => void): void => {
  setter('');
};

const setModalAutoClose = (callback: () => void, delay: number): (() => void) => {
  const timer = setTimeout(callback, delay);
  return () => clearTimeout(timer);
};


const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => (
  <div className={LAYOUT_CLASSES.loadingContainer}>
    <div className={`loader border-t-transparent border-solid border-2 border-white-900 rounded-full ${ANIMATION_CONFIG.spin} ${LOADER_CLASSES[size]}`}></div>
  </div>
);

const FaucetForm: React.FC<FaucetFormProps> = ({
  did,
  loading,
  tokenName,
  onDidChange,
  onSubmit
}) => {
  const isSubmitDisabled = loading || !validateDid(did);
  const submitButtonClasses = `${LAYOUT_CLASSES.submitButton} ${
    isSubmitDisabled ? LAYOUT_CLASSES.submitButtonDisabled : LAYOUT_CLASSES.submitButtonEnabled
  }`;

  return (
    <div className={LAYOUT_CLASSES.content}>
      <h1 className={LAYOUT_CLASSES.title}>{tokenName.toUpperCase()} Faucet</h1>
      <p className={LAYOUT_CLASSES.subtitle}>
        Get test {tokenName.toUpperCase()} tokens for the testnet
      </p>

      <div className={LAYOUT_CLASSES.form}>
        <input
          disabled={loading}
          value={did}
          onChange={(e) => onDidChange(e.target.value)}
          type="text"
          placeholder="Enter your DID"
          className={LAYOUT_CLASSES.input}
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={submitButtonClasses}
        >
          {loading ? (
            <LoadingSpinner size="md" />
          ) : (
            <>
              Get TRIE
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SuccessModal: React.FC<SuccessModalProps> = ({ show, onClose, tokenName }) => {
  if (!show) return null;

  return (
    <div className={LAYOUT_CLASSES.modalOverlay}>
      <div className={LAYOUT_CLASSES.modalContainer}>
        <button
          onClick={onClose}
          className={LAYOUT_CLASSES.modalCloseButton}
        >
          <X className="w-5 h-5" />
        </button>

        <div className={LAYOUT_CLASSES.modalContent}>
          <div className={LAYOUT_CLASSES.successIcon}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={LAYOUT_CLASSES.modalTitle}>Success!</h3>
          <p className={LAYOUT_CLASSES.modalMessage}>
            {tokenName.toUpperCase()} token request has been successful. You should get them in some time!
          </p>
        </div>

        <button
          onClick={onClose}
          className={LAYOUT_CLASSES.modalButton}
        >
          Close
        </button>
      </div>
    </div>
  );
};


function Faucet({ className }: FaucetProps = {}) {
  const [did, setDid] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const tokenName = useTokenName();

 
  useEffect(() => {
    if (showModal) {
      const cleanup = setModalAutoClose(() => {
        setShowModal(false);
      }, MODAL_AUTO_CLOSE_DELAY);
      
      return cleanup;
    }
  }, [showModal]);

  
  useEffect(() => {
    const walletDetails = getWalletDetailsFromStorage();
    if (walletDetails?.did) {
      setDid(walletDetails.did);
    }
  }, []);

  const handleDidChange = (value: string): void => {
    setDid(value);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateDid(did)) return;

    setLoading(true);
    try {
      const response = await simulateApiCall(did, FAUCET_TOKEN_COUNT);

      if (response?.success) {
        setShowModal(true);
        return;
      }
      
      showErrorToast(response?.message || "Failed to add faucet");
    } catch (error) {
      showErrorToast("An error occurred while processing your request");
    } finally {
      setLoading(false);
      clearInput(setDid);
    }
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  return (
    <div className={`${LAYOUT_CLASSES.container} ${className || ''}`}>
      <div className={LAYOUT_CLASSES.wrapper}>
        <img
          src="/trie-nav-logo@4x.png"
          alt={`${tokenName.toUpperCase()} Logo`}
          className={LAYOUT_CLASSES.logo}
        />

        <FaucetForm
          did={did}
          loading={loading}
          tokenName={tokenName}
          onDidChange={handleDidChange}
          onSubmit={handleSubmit}
        />
      </div>

      <SuccessModal
        show={showModal}
        onClose={handleCloseModal}
        tokenName={tokenName}
      />
    </div>
  );
}

export default Faucet;