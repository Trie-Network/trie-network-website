import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui';
import { useTokenName } from '@/contexts/TokenNameContext';


interface Transaction {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'completed' | 'processing' | 'pending';
}

interface WithdrawViewProps {
  className?: string;
}

interface HeaderProps {
  isLoading: boolean;
  availableBalance: number;
}

interface WithdrawalFormProps {
  isLoading: boolean;
  withdrawAmount: string;
  walletAddress: string;
  availableBalance: number;
  isProcessing: boolean;
  tokenName: string;
  onWithdrawAmountChange: (value: string) => void;
  onWithdraw: () => void;
  onCopyAddress: () => void;
  onSetMaxAmount: () => void;
}

interface WalletAddressInputProps {
  walletAddress: string;
  onCopy: () => void;
}

interface AmountInputProps {
  withdrawAmount: string;
  availableBalance: number;
  tokenName: string;
  onAmountChange: (value: string) => void;
  onSetMax: () => void;
}

interface SubmitButtonProps {
  withdrawAmount: string;
  availableBalance: number;
  isProcessing: boolean;
  onWithdraw: () => void;
}

interface TransactionHistoryProps {
  isLoading: boolean;
  transactions: Transaction[];
  tokenName: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  tokenName: string;
}

interface LoadingRowProps {
  index: number;
}


const LOADING_DURATION = 1500;
const WITHDRAWAL_PROCESSING_TIME = 2000;
const MIN_WITHDRAWAL_AMOUNT = 100;

const ANIMATION_CONFIG = {
  spin: 'animate-spin -ml-1 mr-2 h-4 w-4 text-white'
} as const;

const LAYOUT_CLASSES = {
  container: 'min-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide',
  wrapper: 'max-w-4xl mx-auto',
  header: 'flex flex-col sm:flex-row sm:items-center justify-between mb-8 px-4 md:px-6 lg:px-8 pt-8',
  headerContent: 'flex items-center gap-4 mt-4 sm:mt-0',
  title: 'text-2xl font-bold text-gray-900',
  subtitle: 'mt-1 text-sm text-gray-500',
  balanceLabel: 'text-sm text-gray-500',
  balanceAmount: 'text-2xl font-bold text-gray-900',
  grid: 'grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-6 lg:px-8 pb-8',
  formContainer: 'space-y-6',
  card: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  cardTitle: 'text-lg font-semibold text-gray-900 mb-6',
  formSection: 'mb-6',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  walletInputContainer: 'flex items-center gap-2',
  walletInput: 'w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500',
  copyButton: 'p-2 text-gray-500 hover:text-gray-700',
  amountInputContainer: 'relative',
  amountInput: 'w-full pl-12 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284a5] focus:border-transparent',
  tokenPrefix: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 sm:text-sm',
  maxButton: 'absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-[#0284a5] hover:text-[#026d8a]',
  minAmountText: 'mt-2 text-xs text-gray-500',
  submitContainer: 'mt-6',
  submitButton: 'w-full px-4 py-2 text-sm font-medium text-white bg-[#0284a5] rounded-lg hover:bg-[#026d8a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
  processingText: 'mt-2 text-xs text-center text-gray-500',
  historyCard: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden',
  historyHeader: 'p-6 border-b border-[#e1e3e5]',
  historyTitle: 'text-lg font-semibold text-gray-900',
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  statusBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
} as const;

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800'
} as const;

const LOADING_SKELETON_CONFIG = {
  titleWidth: 'w-48',
  titleHeight: 'h-8',
  subtitleWidth: 'w-64',
  subtitleHeight: 'h-4',
  balanceWidth: 'w-32',
  balanceHeight: 'h-8',
  cardTitleWidth: 'w-48',
  cardTitleHeight: 'h-6',
  labelWidth: 'w-32',
  labelHeight: 'h-4',
  inputHeight: 'h-10',
  buttonHeight: 'h-10',
  dateWidth: 'w-24',
  dateHeight: 'h-4',
  amountWidth: 'w-20',
  amountHeight: 'h-4',
  statusWidth: 'w-24',
  statusHeight: 'h-6',
  rows: 5
} as const;


const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusBadgeStyle = (status: Transaction['status']): string => {
  return `${LAYOUT_CLASSES.statusBadge} ${STATUS_STYLES[status]}`;
};

const simulateLoading = (duration: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

const simulateWithdrawal = (duration: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
   
  } catch (error) {
   
  }
};

const validateWithdrawalAmount = (amount: string, availableBalance: number): boolean => {
  const numAmount = parseFloat(amount);
  return numAmount > 0 && numAmount <= availableBalance && numAmount >= MIN_WITHDRAWAL_AMOUNT;
};


const Header: React.FC<HeaderProps> = ({ isLoading, availableBalance }) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.header}>
        <div>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.titleWidth} ${LOADING_SKELETON_CONFIG.titleHeight} mb-2`} />
          <Skeleton className={`${LOADING_SKELETON_CONFIG.subtitleWidth} ${LOADING_SKELETON_CONFIG.subtitleHeight}`} />
        </div>
        <div className={LAYOUT_CLASSES.headerContent}>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.balanceWidth} ${LOADING_SKELETON_CONFIG.balanceHeight}`} />
          <Skeleton className={`${LOADING_SKELETON_CONFIG.balanceWidth} ${LOADING_SKELETON_CONFIG.balanceHeight}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={LAYOUT_CLASSES.header}>
      <div>
        <h1 className={LAYOUT_CLASSES.title}>Withdraw Funds</h1>
        <p className={LAYOUT_CLASSES.subtitle}>
          Withdraw your earnings to your XELL wallet
        </p>
      </div>
      <div className={LAYOUT_CLASSES.headerContent}>
        <span className={LAYOUT_CLASSES.balanceLabel}>Available balance:</span>
        <span className={LAYOUT_CLASSES.balanceAmount}>${availableBalance.toFixed(2)}</span>
      </div>
    </div>
  );
};

const WalletAddressInput: React.FC<WalletAddressInputProps> = ({ walletAddress, onCopy }) => (
  <div className={LAYOUT_CLASSES.formSection}>
    <label className={LAYOUT_CLASSES.label}>
      XELL Wallet Address
    </label>
    <div className={LAYOUT_CLASSES.walletInputContainer}>
      <input
        type="text"
        value={walletAddress}
        readOnly
        className={LAYOUT_CLASSES.walletInput}
      />
      <button 
        onClick={onCopy}
        className={LAYOUT_CLASSES.copyButton}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
);

const AmountInput: React.FC<AmountInputProps> = ({ 
  withdrawAmount, 
  availableBalance, 
  tokenName, 
  onAmountChange, 
  onSetMax 
}) => (
  <div className={LAYOUT_CLASSES.formSection}>
    <label className={LAYOUT_CLASSES.label}>
      Amount to Withdraw
    </label>
    <div className={LAYOUT_CLASSES.amountInputContainer}>
      <div className={LAYOUT_CLASSES.tokenPrefix}>
        {tokenName.toUpperCase()}
      </div>
      <input
        type="text"
        value={withdrawAmount}
        onChange={(e) => onAmountChange(e.target.value)}
        className={LAYOUT_CLASSES.amountInput}
        placeholder="0.00"
      />
      <div className={LAYOUT_CLASSES.maxButton}>
        <button
          onClick={onSetMax}
          className="text-sm text-[#0284a5] hover:text-[#026d8a]"
        >
          Max
        </button>
      </div>
    </div>
    <p className={LAYOUT_CLASSES.minAmountText}>
      Minimum withdrawal: {MIN_WITHDRAWAL_AMOUNT} {tokenName}
    </p>
  </div>
);

const SubmitButton: React.FC<SubmitButtonProps> = ({ 
  withdrawAmount, 
  availableBalance, 
  isProcessing, 
  onWithdraw 
}) => {
  const isDisabled = !withdrawAmount || !validateWithdrawalAmount(withdrawAmount, availableBalance) || isProcessing;

  return (
    <div className={LAYOUT_CLASSES.submitContainer}>
      <button
        onClick={onWithdraw}
        disabled={isDisabled}
        className={LAYOUT_CLASSES.submitButton}
      >
        {isProcessing ? (
          <>
            <svg className={ANIMATION_CONFIG.spin} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          'Withdraw to XELL Wallet'
        )}
      </button>
      <p className={LAYOUT_CLASSES.processingText}>
        Withdrawals typically process within 5-10 minutes
      </p>
    </div>
  );
};

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  isLoading,
  withdrawAmount,
  walletAddress,
  availableBalance,
  isProcessing,
  tokenName,
  onWithdrawAmountChange,
  onWithdraw,
  onCopyAddress,
  onSetMaxAmount
}) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.formContainer}>
        <div className={LAYOUT_CLASSES.card}>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.cardTitleWidth} ${LOADING_SKELETON_CONFIG.cardTitleHeight} mb-6`} />
          <div className="space-y-6">
            <div>
              <Skeleton className={`${LOADING_SKELETON_CONFIG.labelWidth} ${LOADING_SKELETON_CONFIG.labelHeight} mb-2`} />
              <Skeleton className={`w-full ${LOADING_SKELETON_CONFIG.inputHeight}`} />
            </div>
            <div>
              <Skeleton className={`${LOADING_SKELETON_CONFIG.labelWidth} ${LOADING_SKELETON_CONFIG.labelHeight} mb-2`} />
              <Skeleton className={`w-full ${LOADING_SKELETON_CONFIG.inputHeight}`} />
            </div>
            <Skeleton className={`w-full ${LOADING_SKELETON_CONFIG.buttonHeight}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={LAYOUT_CLASSES.formContainer}>
      <div className={LAYOUT_CLASSES.card}>
        <h2 className={LAYOUT_CLASSES.cardTitle}>Withdrawal Details</h2>
        
        <WalletAddressInput 
          walletAddress={walletAddress}
          onCopy={onCopyAddress}
        />

        <AmountInput 
          withdrawAmount={withdrawAmount}
          availableBalance={availableBalance}
          tokenName={tokenName}
          onAmountChange={onWithdrawAmountChange}
          onSetMax={onSetMaxAmount}
        />

        <SubmitButton 
          withdrawAmount={withdrawAmount}
          availableBalance={availableBalance}
          isProcessing={isProcessing}
          onWithdraw={onWithdraw}
        />
      </div>
    </div>
  );
};

const LoadingRow: React.FC<LoadingRowProps> = ({ index }) => (
  <tr key={index}>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.dateWidth} ${LOADING_SKELETON_CONFIG.dateHeight}`} />
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.amountWidth} ${LOADING_SKELETON_CONFIG.amountHeight}`} />
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.statusWidth} ${LOADING_SKELETON_CONFIG.statusHeight} rounded-full`} />
    </td>
  </tr>
);

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, tokenName }) => (
  <tr className={LAYOUT_CLASSES.tableRow}>
    <td className={LAYOUT_CLASSES.tableCell}>
      {formatDate(transaction.date)}
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      {transaction.amount} {tokenName}
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <span className={getStatusBadgeStyle(transaction.status)}>
        {capitalizeFirst(transaction.status)}
      </span>
    </td>
  </tr>
);

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  isLoading, 
  transactions, 
  tokenName 
}) => (
  <div className={LAYOUT_CLASSES.historyCard}>
    <div className={LAYOUT_CLASSES.historyHeader}>
      <h2 className={LAYOUT_CLASSES.historyTitle}>Transaction History</h2>
    </div>
    <div className="overflow-x-auto">
      <table className={LAYOUT_CLASSES.table}>
        <thead className={LAYOUT_CLASSES.tableHead}>
          <tr>
            <th scope="col" className={LAYOUT_CLASSES.tableHeader}>
              Date
            </th>
            <th scope="col" className={LAYOUT_CLASSES.tableHeader}>
              Amount
            </th>
            <th scope="col" className={LAYOUT_CLASSES.tableHeader}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={LAYOUT_CLASSES.tableBody}>
          {isLoading ? (
            Array.from({ length: LOADING_SKELETON_CONFIG.rows }).map((_, index) => (
              <LoadingRow key={index} index={index} />
            ))
          ) : (
            transactions.map((transaction) => (
              <TransactionRow 
                key={transaction.id} 
                transaction={transaction}
                tokenName={tokenName}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);


export function WithdrawView({ className }: WithdrawViewProps = {}) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [walletAddress] = useState('');
  const [availableBalance] = useState(0);
  const [transactions] = useState<Transaction[]>([]);
  const tokenName = useTokenName();

 
  useEffect(() => {
    const loadData = async () => {
      await simulateLoading(LOADING_DURATION);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleWithdraw = async () => {
    if (!validateWithdrawalAmount(withdrawAmount, availableBalance)) return;

    setIsProcessing(true);
    try {
      await simulateWithdrawal(WITHDRAWAL_PROCESSING_TIME);
      
      
      setWithdrawAmount('');
      
      
    } catch (error) {
     
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAddress = async () => {
    await copyToClipboard(walletAddress);
  };

  const handleSetMaxAmount = () => {
    setWithdrawAmount(availableBalance.toString());
  };

  return (
    <div className={`${LAYOUT_CLASSES.container} ${className || ''}`}>
      <div className={LAYOUT_CLASSES.wrapper}>
        <Header isLoading={isLoading} availableBalance={availableBalance} />

        <div className={LAYOUT_CLASSES.grid}>
          <WithdrawalForm
            isLoading={isLoading}
            withdrawAmount={withdrawAmount}
            walletAddress={walletAddress}
            availableBalance={availableBalance}
            isProcessing={isProcessing}
            tokenName={tokenName}
            onWithdrawAmountChange={setWithdrawAmount}
            onWithdraw={handleWithdraw}
            onCopyAddress={handleCopyAddress}
            onSetMaxAmount={handleSetMaxAmount}
          />

          <TransactionHistory
            isLoading={isLoading}
            transactions={transactions}
            tokenName={tokenName}
          />
        </div>
      </div>
    </div>
  );
}