import { Modal } from '@/components/ui';
import { LAYOUT_CLASSES } from '../types';

interface ClearConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const ClearConfirmationModal: React.FC<ClearConfirmationModalProps> = ({
    show,
    onClose,
    onConfirm
}) => (
    <Modal show={show} onClose={onClose} title="Clear System Prompt">
        <div className={LAYOUT_CLASSES.modal}>
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4 flex items-start">
                <div className="mr-3 mt-0.5">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-amber-800 text-sm">
                    Are you sure you want to clear the system prompt? This action cannot be undone.
                </p>
            </div>
            <div className="flex justify-end pt-2">
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className={LAYOUT_CLASSES.button.secondary}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={LAYOUT_CLASSES.button.danger}
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    </Modal>
);
