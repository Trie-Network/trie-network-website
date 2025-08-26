import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions, STATUS_STYLES, Transaction } from '@/hooks';
import { Pagination, Skeleton } from '@/components/ui';



interface TransactionsViewProps {
  className?: string;
}

interface HeaderProps {
  isLoading: boolean;
}

interface TableHeaderProps {
  sortConfig: { key: string; direction: string };
  onSort: (key: string) => void;
}

interface TableRowProps {
  transaction: Transaction;
  onViewClick: (transaction: Transaction) => void;
}

interface LoadingRowProps {
  index: number;
}

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
}

interface AssetDetailsProps {
  asset: Transaction['asset'];
}

interface SellerDetailsProps {
  seller: Transaction['seller'];
}

interface PaymentDetailsProps {
  amount: string;
  status: 'completed' | 'pending' | 'processing';
}


const ITEMS_PER_PAGE = 12;
const LOADING_DURATION = 1500;
const ANIMATION_CONFIG = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 0.25 },
    exit: { opacity: 0 }
  },
  sidebar: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'tween', duration: 0.3 }
  }
} as const;

const LAYOUT_CLASSES = {
  container: 'px-4 md:px-6 lg:px-8 py-8 h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide',
  wrapper: 'max-w-6xl mx-auto',
  header: 'flex items-center justify-between mb-8',
  title: 'text-2xl font-bold text-gray-900',
  subtitle: 'mt-1 text-sm text-gray-500',
  tableContainer: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden',
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer',
  tableHeaderStatic: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
  assetContainer: 'flex items-center',
  assetImage: 'h-10 w-10 rounded-lg object-cover',
  assetInfo: 'ml-4',
  assetName: 'text-sm font-medium text-gray-900',
  assetType: 'text-sm text-gray-500 capitalize',
  sellerContainer: 'flex items-center',
  sellerAvatar: 'h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm',
  sellerInfo: 'ml-3',
  sellerName: 'text-sm font-medium text-gray-900',
  statusBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  viewButton: 'text-[#0284a5] hover:text-[#026d8a]',
  paginationContainer: 'mt-8',
  sidebar: 'fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl overflow-y-auto pt-[112px]',
  sidebarHeader: 'px-6 py-4 border-b border-gray-200',
  sidebarTitle: 'text-lg font-semibold text-gray-900',
  closeButton: 'text-gray-400 hover:text-gray-500',
  sidebarContent: 'px-6 py-4',
  detailSection: 'space-y-6',
  detailLabel: 'block text-sm font-medium text-gray-500',
  detailValue: 'mt-1 text-sm text-gray-900',
  detailValueMono: 'mt-1 text-sm text-gray-900 font-mono',
  assetCard: 'flex items-start p-4 bg-gray-50 rounded-lg',
  assetCardImage: 'w-16 h-16 rounded-lg object-cover',
  assetCardInfo: 'ml-4',
  assetCardName: 'text-sm font-medium text-gray-900',
  assetCardType: 'text-sm text-gray-500 capitalize',
  sellerCard: 'flex items-center',
  sellerCardAvatar: 'h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white',
  sellerCardInfo: 'ml-3',
  sellerCardName: 'text-sm font-medium text-gray-900',
  paymentCard: 'bg-gray-50 rounded-lg p-4',
  paymentRow: 'flex justify-between items-center',
  paymentRowWithMargin: 'flex justify-between items-center mt-2',
  accessButton: 'w-full px-4 py-2 text-sm font-medium text-white bg-[#0284a5] rounded-lg hover:bg-[#026d8a]'
} as const;

const SORT_ICON_CLASSES = {
  base: 'w-4 h-4 transition-transform',
  rotated: 'w-4 h-4 transition-transform transform rotate-180'
} as const;

const LOADING_SKELETON_CONFIG = {
  rows: 5,
  titleWidth: 'w-48',
  titleHeight: 'h-8',
  subtitleWidth: 'w-64',
  subtitleHeight: 'h-4',
  dateWidth: 'w-24',
  dateHeight: 'h-4',
  assetImageSize: 'w-10 h-10',
  assetNameWidth: 'w-32',
  assetNameHeight: 'h-4',
  assetTypeWidth: 'w-24',
  assetTypeHeight: 'h-3',
  sellerAvatarSize: 'w-8 h-8',
  sellerNameWidth: 'w-24',
  sellerNameHeight: 'h-4',
  amountWidth: 'w-16',
  amountHeight: 'h-4',
  statusWidth: 'w-20',
  statusHeight: 'h-6',
  viewButtonWidth: 'w-12',
  viewButtonHeight: 'h-4'
} as const;


const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusBadgeStyle = (status: 'completed' | 'pending' | 'processing'): string => {
  return `${LAYOUT_CLASSES.statusBadge} ${STATUS_STYLES[status]}`;
};

const simulateLoading = (duration: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration));
};


const Header: React.FC<HeaderProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.header}>
        <div>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.titleWidth} ${LOADING_SKELETON_CONFIG.titleHeight} mb-2`} />
          <Skeleton className={`${LOADING_SKELETON_CONFIG.subtitleWidth} ${LOADING_SKELETON_CONFIG.subtitleHeight}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={LAYOUT_CLASSES.header}>
      <div>
        <h1 className={LAYOUT_CLASSES.title}>Transaction History</h1>
        <p className={LAYOUT_CLASSES.subtitle}>
          View and manage your purchases
        </p>
      </div>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ sortConfig, onSort }) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    
    return (
      <svg 
        className={sortConfig.direction === 'desc' ? SORT_ICON_CLASSES.rotated : SORT_ICON_CLASSES.base} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <thead className={LAYOUT_CLASSES.tableHead}>
      <tr>
        <th
          scope="col"
          className={LAYOUT_CLASSES.tableHeader}
          onClick={() => onSort('date')}
        >
          <div className="flex items-center gap-2">
            Date
            {getSortIcon('date')}
          </div>
        </th>
        <th scope="col" className={LAYOUT_CLASSES.tableHeaderStatic}>
          Asset
        </th>
        <th scope="col" className={LAYOUT_CLASSES.tableHeaderStatic}>
          Seller
        </th>
        <th
          scope="col"
          className={LAYOUT_CLASSES.tableHeader}
          onClick={() => onSort('amount')}
        >
          <div className="flex items-center gap-2">
            Amount
            {getSortIcon('amount')}
          </div>
        </th>
        <th scope="col" className={LAYOUT_CLASSES.tableHeaderStatic}>
          Status
        </th>
        <th scope="col" className="relative px-6 py-3">
        </th>
      </tr>
    </thead>
  );
};

const LoadingRow: React.FC<LoadingRowProps> = ({ index }) => (
  <tr key={index}>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.dateWidth} ${LOADING_SKELETON_CONFIG.dateHeight}`} />
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <div className={LAYOUT_CLASSES.assetContainer}>
        <div className={`${LOADING_SKELETON_CONFIG.assetImageSize} flex-shrink-0`}>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.assetImageSize} rounded-lg`} />
        </div>
        <div className={LAYOUT_CLASSES.assetInfo}>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.assetNameWidth} ${LOADING_SKELETON_CONFIG.assetNameHeight} mb-1`} />
          <Skeleton className={`${LOADING_SKELETON_CONFIG.assetTypeWidth} ${LOADING_SKELETON_CONFIG.assetTypeHeight}`} />
        </div>
      </div>
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <div className={LAYOUT_CLASSES.sellerContainer}>
        <Skeleton className={`${LOADING_SKELETON_CONFIG.sellerAvatarSize} rounded-full`} />
        <div className={LAYOUT_CLASSES.sellerInfo}>
          <Skeleton className={`${LOADING_SKELETON_CONFIG.sellerNameWidth} ${LOADING_SKELETON_CONFIG.sellerNameHeight}`} />
        </div>
      </div>
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.amountWidth} ${LOADING_SKELETON_CONFIG.amountHeight}`} />
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <Skeleton className={`${LOADING_SKELETON_CONFIG.statusWidth} ${LOADING_SKELETON_CONFIG.statusHeight} rounded-full`} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <Skeleton className={`${LOADING_SKELETON_CONFIG.viewButtonWidth} ${LOADING_SKELETON_CONFIG.viewButtonHeight} ml-auto`} />
    </td>
  </tr>
);

const TableRow: React.FC<TableRowProps> = ({ transaction, onViewClick }) => (
  <tr className={LAYOUT_CLASSES.tableRow}>
    <td className={LAYOUT_CLASSES.tableCell}>
      {formatDate(transaction.date)}
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <div className={LAYOUT_CLASSES.assetContainer}>
        <div className={`${LOADING_SKELETON_CONFIG.assetImageSize} flex-shrink-0`}>
          <img 
            className={LAYOUT_CLASSES.assetImage} 
            src={transaction.asset.image} 
            alt={transaction.asset.name} 
          />
        </div>
        <div className={LAYOUT_CLASSES.assetInfo}>
          <div className={LAYOUT_CLASSES.assetName}>
            {transaction.asset.name}
          </div>
          <div className={LAYOUT_CLASSES.assetType}>
            {transaction.asset.type}
          </div>
        </div>
      </div>
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <div className={LAYOUT_CLASSES.sellerContainer}>
        <div className={LAYOUT_CLASSES.sellerAvatar}>
          {transaction.seller.avatar}
        </div>
        <div className={LAYOUT_CLASSES.sellerInfo}>
          <div className={LAYOUT_CLASSES.sellerName}>
            {transaction.seller.name}
          </div>
        </div>
      </div>
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      ${transaction.amount}
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <span className={getStatusBadgeStyle(transaction.status)}>
        {capitalizeFirst(transaction.status)}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button 
        className={LAYOUT_CLASSES.viewButton}
        onClick={() => onViewClick(transaction)}
      >
        View
      </button>
    </td>
  </tr>
);

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => (
  <div>
    <label className={LAYOUT_CLASSES.detailLabel}>Asset</label>
    <div className={LAYOUT_CLASSES.assetCard}>
      <img 
        src={asset.image} 
        alt={asset.name}
        className={LAYOUT_CLASSES.assetCardImage}
      />
      <div className={LAYOUT_CLASSES.assetCardInfo}>
        <h3 className={LAYOUT_CLASSES.assetCardName}>
          {asset.name}
        </h3>
        <p className={LAYOUT_CLASSES.assetCardType}>
          {asset.type}
        </p>
      </div>
    </div>
  </div>
);

const SellerDetails: React.FC<SellerDetailsProps> = ({ seller }) => (
  <div>
    <label className={`${LAYOUT_CLASSES.detailLabel} mb-2`}>Seller</label>
    <div className={LAYOUT_CLASSES.sellerCard}>
      <div className={LAYOUT_CLASSES.sellerCardAvatar}>
        {seller.avatar}
      </div>
      <div className={LAYOUT_CLASSES.sellerCardInfo}>
        <p className={LAYOUT_CLASSES.sellerCardName}>
          {seller.name}
        </p>
      </div>
    </div>
  </div>
);

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ amount, status }) => (
  <div>
    <label className={`${LAYOUT_CLASSES.detailLabel} mb-2`}>Payment Details</label>
    <div className={LAYOUT_CLASSES.paymentCard}>
      <div className={LAYOUT_CLASSES.paymentRow}>
        <span className="text-sm text-gray-500">Amount</span>
        <span className="text-sm font-medium text-gray-900">
          ${amount}
        </span>
      </div>
      <div className={LAYOUT_CLASSES.paymentRowWithMargin}>
        <span className="text-sm text-gray-500">Status</span>
        <span className={getStatusBadgeStyle(status)}>
          {capitalizeFirst(status)}
        </span>
      </div>
    </div>
  </div>
);

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction, onClose }) => (
  <>
    
    <motion.div
      initial={ANIMATION_CONFIG.backdrop.initial}
      animate={ANIMATION_CONFIG.backdrop.animate}
      exit={ANIMATION_CONFIG.backdrop.exit}
      className="fixed inset-0 bg-black"
      onClick={onClose}
    />

    
    <motion.div
      initial={ANIMATION_CONFIG.sidebar.initial}
      animate={ANIMATION_CONFIG.sidebar.animate}
      exit={ANIMATION_CONFIG.sidebar.exit}
      transition={ANIMATION_CONFIG.sidebar.transition}
      className={LAYOUT_CLASSES.sidebar}
    >
      <div className={LAYOUT_CLASSES.sidebarHeader}>
        <div className="flex items-center justify-between">
          <h2 className={LAYOUT_CLASSES.sidebarTitle}>Transaction Details</h2>
          <button
            onClick={onClose}
            className={LAYOUT_CLASSES.closeButton}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className={LAYOUT_CLASSES.sidebarContent}>
        <div className={LAYOUT_CLASSES.detailSection}>
         
          <div>
            <label className={LAYOUT_CLASSES.detailLabel}>Transaction ID</label>
            <p className={LAYOUT_CLASSES.detailValueMono}>{transaction.id}</p>
          </div>

         
          <div>
            <label className={LAYOUT_CLASSES.detailLabel}>Date & Time</label>
            <p className={LAYOUT_CLASSES.detailValue}>
              {formatDateTime(transaction.date)}
            </p>
          </div>

         
          <AssetDetails asset={transaction.asset} />

          
          <SellerDetails seller={transaction.seller} />

         
          <PaymentDetails amount={transaction.amount} status={transaction.status} />

         
          {transaction.status === 'completed' && (
            <button className={LAYOUT_CLASSES.accessButton}>
              Access Asset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  </>
);


export function TransactionsView({ className }: TransactionsViewProps = {}) {
  const { 
    transactions: sortedTransactions, 
    selectedTransaction, 
    setSelectedTransaction, 
    sortConfig, 
    handleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages
  } = useTransactions();

  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const loadData = async () => {
      await simulateLoading(LOADING_DURATION);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className={`${LAYOUT_CLASSES.container} ${className || ''}`}>
      <div className={LAYOUT_CLASSES.wrapper}>
        <Header isLoading={isLoading} />

       
        <div className={LAYOUT_CLASSES.tableContainer}>
          <div className="overflow-x-auto">
            <table className={LAYOUT_CLASSES.table}>
              <TableHeader sortConfig={sortConfig} onSort={handleSort} />
              <tbody className={LAYOUT_CLASSES.tableBody}>
                {isLoading ? (
                  Array.from({ length: LOADING_SKELETON_CONFIG.rows }).map((_, index) => (
                    <LoadingRow key={index} index={index} />
                  ))
                ) : (
                  sortedTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id} 
                      transaction={transaction}
                      onViewClick={handleViewTransaction}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        
        {totalPages > 1 && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            className={LAYOUT_CLASSES.paginationContainer}
          />
        )}
      </div>

      
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetails 
            transaction={selectedTransaction}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>
    </div>
  );
}