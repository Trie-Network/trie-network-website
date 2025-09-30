interface BalancePanelProps {
    inferenceBalance: number | null;
    balanceLoading: boolean;
    uploading: boolean;
    isBuyingTokens: boolean;
    onBuyMoreTokens: () => void;
}

export const BalancePanel: React.FC<BalancePanelProps> = ({
    inferenceBalance,
    balanceLoading,
    uploading,
    isBuyingTokens,
    onBuyMoreTokens
}) => {
    const isDisabled = uploading || isBuyingTokens || balanceLoading;
    
    return (
        <div className="p-3 sm:p-4 rounded-xl border border-cyan-500 bg-white mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#19A7C7">T</text>
                    </svg>
                    <span className="font-semibold text-cyan-500 text-xs sm:text-sm">Inference Balance:</span>
                </div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                    {balanceLoading ? (
                        <span className="animate-pulse">Loading...</span>
                    ) : (
                        `${inferenceBalance ?? 0} tokens`
                    )}
                </span>
            </div>
            <div className="text-xs text-slate-500 mb-3 sm:mb-4 ml-6 sm:ml-7">5 TRIE = 500 tokens</div>
                <button
                    className={`w-full font-semibold py-2 px-2 rounded-lg text-white text-sm sm:text-base ${
                        isDisabled 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer'
                    }`}
                    onClick={onBuyMoreTokens}
                    disabled={isDisabled}
                >
                {(uploading || isBuyingTokens) ? (
                    <span className="flex items-center justify-center">
                        <span className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span className="truncate">Processing...</span>
                    </span>
                ) : balanceLoading ? (
                    <span className="flex items-center justify-center">
                        <span className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span className="truncate">Loading...</span>
                    </span>
                ) : (
                    "Buy More"
                )}
            </button>
        </div>
    );
};

