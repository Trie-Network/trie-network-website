import React from 'react';
import { X } from 'lucide-react';
import { getNetworkColor, getNetworkHoverColor } from '@/config/colors';


interface ExtensionModalProps {
  show: boolean;
  onClose: () => void;
  onInstallExtension: () => void;
  onReloadPage: () => void;
}


const LAYOUT_CLASSES = {
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    container: 'bg-gray-800 rounded-lg p-6 max-w-md w-full relative',
    closeButton: 'absolute top-4 right-4 text-gray-400 hover:text-white',
    content: 'text-center mb-6',
    icon: 'w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4',
    title: 'text-white text-xl font-bold font-[\'IBM_Plex_Sans\']',
    description: 'text-gray-300 mt-2 font-[\'IBM_Plex_Sans\']',
    buttonContainer: 'flex flex-col space-y-3',
    primaryButton: 'w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors font-[\'IBM_Plex_Sans\']',
    secondaryButton: 'w-full py-3 text-white font-semibold rounded-lg transition-colors font-[\'IBM_Plex_Sans\']',
    cancelButton: 'w-full py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors font-[\'IBM_Plex_Sans\']'
  }
} as const;


const ExtensionModal: React.FC<ExtensionModalProps> = ({
  show,
  onClose,
  onInstallExtension,
  onReloadPage
}) => {
  if (!show) return null;

  return (
    <div className={LAYOUT_CLASSES.modal.overlay}>
      <div className={LAYOUT_CLASSES.modal.container}>
        <button onClick={onClose} className={LAYOUT_CLASSES.modal.closeButton}>
          <X className="w-5 h-5" />
        </button>

        <div className={LAYOUT_CLASSES.modal.content}>
          <div className={LAYOUT_CLASSES.modal.icon}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={LAYOUT_CLASSES.modal.title}>
            Wallet Connection Issue
          </h3>
          <p className={LAYOUT_CLASSES.modal.description}>
            There seems to be an issue with the XELL wallet connection. You may need to install the extension or reload the page to continue.
          </p>
        </div>

        <div className={LAYOUT_CLASSES.modal.buttonContainer}>
          <button
            onClick={onInstallExtension}
            className={LAYOUT_CLASSES.modal.primaryButton}
          >
            Install Extension
          </button>

          <button
            onClick={onReloadPage}
            className={LAYOUT_CLASSES.modal.secondaryButton}
            style={{ backgroundColor: getNetworkColor() }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getNetworkHoverColor()}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = getNetworkColor()}
          >
            Reload Page
          </button>

          <button
            onClick={onClose}
            className={LAYOUT_CLASSES.modal.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


export default ExtensionModal;


