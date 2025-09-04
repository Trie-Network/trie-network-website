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
    return (
        <div className="mt-4 mb-6 p-4 rounded-xl border" style={{ borderColor: '#19A7C7', background: '#fff' }}>
            <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" style={{ color: '#19A7C7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#19A7C7">T</text>
                </svg>
                <span className="font-semibold" style={{ color: '#19A7C7', fontSize: '0.85rem' }}>Inference Balance:</span>
                <span className="font-bold ml-1" style={{ color: '#1e293b', fontSize: '0.85rem' }}>
                    {balanceLoading ? (
                        <span className="animate-pulse">Loading...</span>
                    ) : (
                        `${inferenceBalance ?? 0} tokens`
                    )}
                </span>
            </div>
            <div className="text-xs text-slate-500 mb-4 ml-7">5 TRIE = 500 tokens</div>
            <button
                className="w-full font-semibold py-2 rounded-lg transition-colors"
                style={{ background: '#0196B7', color: '#fff' }}
                onClick={onBuyMoreTokens}
                onMouseOver={e => (e.currentTarget.style.background = '#017a99')}
                onMouseOut={e => (e.currentTarget.style.background = '#0196B7')}
                disabled={uploading || isBuyingTokens}
            >
                {(uploading || isBuyingTokens) ? (
                    <span className="flex items-center justify-center">
                        <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Processing...
                    </span>
                ) : (
                    "Buy More"
                )}
            </button>
        </div>
    );
};

