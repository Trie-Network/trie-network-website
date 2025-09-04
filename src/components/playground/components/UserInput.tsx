import { useRef } from 'react';

interface UserInputProps {
    userMessage: string;
    inputError: boolean;
    isProcessing: boolean;
    isRequestProcessing: boolean;
    onMessageChange: (message: string) => void;
    onRunMessage: () => void;
    onClearInput: () => void;
}

export const UserInput: React.FC<UserInputProps> = ({
    userMessage,
    inputError,
    isProcessing,
    isRequestProcessing,
    onMessageChange,
    onRunMessage,
    onClearInput
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onRunMessage();
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onMessageChange(e.target.value);
    };

    return (
        <div className="border-t border-slate-100 p-5 bg-white">
            <div className="flex">
                <textarea
                    ref={textareaRef}
                    value={userMessage}
                    onChange={handleMessageChange}
                    className={`flex-1 border ${inputError ? 'border-error ring-1 ring-error' : 'border-slate-200'} rounded-lg p-3 mr-2 text-slate-800 focus:outline-none focus:ring-2 ${inputError ? 'focus:ring-error' : 'focus:ring-primary'} focus:border-transparent resize-none shadow-inner transition-all duration-200`}
                    placeholder={inputError ? "Please enter a message" : "Enter your message here..."}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    disabled={isProcessing || isRequestProcessing}
                />
            </div>
            
            {inputError && (
                <div className="mt-1 text-error text-xs font-medium animate-bounce">
                    Please enter a message before running
                </div>
            )}
            
            <div className="flex justify-end mt-3 items-center">
                <span className="text-xs text-slate-500 mr-auto italic hidden sm:inline-block">
                    Press Shift+Enter for new line
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={onClearInput}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] border border-slate-200 text-slate-600 hover:text-primary hover:border-primary rounded-lg transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 focus:ring-opacity-30 flex items-center justify-center"
                        disabled={isProcessing || isRequestProcessing || userMessage.trim() === ""}
                    >
                        Clear
                    </button>
                    <button
                        onClick={onRunMessage}
                        className={`px-4 py-2 sm:px-5 sm:py-2.5 min-w-[80px] sm:min-w-[90px] ${userMessage.trim() === "" ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover text-white hover:shadow-md'} rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center justify-center relative group`}
                        disabled={userMessage.trim() === "" || isProcessing || isRequestProcessing}
                    >
                        {(isProcessing || isRequestProcessing) ? (
                            <>
                                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                <span className="sm:inline">
                                    {isRequestProcessing ? 'Sending Request...' : 'Processing...'}
                                </span>
                            </>
                        ) : `Try it out`}

                        {userMessage.trim() === "" && !isProcessing && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                Enter a message first
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

