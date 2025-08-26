import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { Select, Skeleton } from '@/components/ui';


interface Transaction {
  id: string;
  date: string;
  buyer: string;
  asset: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TimePeriod {
  id: string;
  label: string;
}

interface EarningsStats {
  earnings: string;
  purchases: string;
  activeAssets: string;
}

interface EarningsStatsData {
  [key: string]: EarningsStats;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface EarningsViewProps {
  primaryColor?: string;
}

interface HeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
}

interface StatsCardProps {
  title: string;
  value: string;
  period: string;
  percentage: string;
  badgeColor: string;
  isLoading: boolean;
}

interface StatsGridProps {
  selectedPeriod: string;
  isLoading: boolean;
}

interface TransactionTableProps {
  transactions: Transaction[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  isLoading: boolean;
}

interface TableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

interface TableRowProps {
  transaction: Transaction;
}

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
}



const TIME_PERIODS: TimePeriod[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' }
];

const STATS_CONFIG = [
  {
    title: 'Total Earnings',
    key: 'earnings',
    percentage: '', 
    badgeColor: 'bg-green-100 text-green-800',
    condition: (value: string) => parseFloat(value) > 0
  },
  {
    title: 'Total Purchases',
    key: 'purchases',
    percentage: '',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    title: 'Active Assets',
    key: 'activeAssets',
    percentage: '', 
    badgeColor: 'bg-purple-100 text-purple-800'
  }
];

const STATUS_BADGE_STYLES = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
} as const;

const LAYOUT_CLASSES = {
  container: 'min-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hide',
  header: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 px-4 md:px-6 lg:px-8 pt-6',
  title: 'text-2xl font-bold text-gray-900 flex-shrink-0',
  select: 'w-full sm:w-[200px]',
  statsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 px-4 md:px-6 lg:px-8',
  statsCard: 'bg-white rounded-xl border border-[#e1e3e5] p-6',
  statsHeader: 'flex items-center justify-between mb-4',
  statsTitle: 'text-sm font-medium text-gray-500',
  statsBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  statsValue: 'flex items-end gap-2',
  statsAmount: 'text-2xl font-bold text-gray-900',
  statsPercentage: 'text-sm text-green-600 mb-1',
  tableContainer: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden mx-4 md:mx-6 lg:mx-8 mb-8',
  tableHeader: 'px-6 py-4 border-b border-[#e1e3e5]',
  tableTitle: 'text-lg font-semibold text-gray-900',
  tableWrapper: 'overflow-x-auto min-w-full',
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  sortableHeader: 'cursor-pointer',
  sortIcon: 'w-4 h-4 transition-transform',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-4 sm:px-6 py-4 whitespace-nowrap',
  tableCellHidden: 'hidden sm:table-cell px-6 py-4 whitespace-nowrap',
  tableCellRight: 'hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium',
  textSm: 'text-sm',
  textGray900: 'text-gray-900',
  textGray500: 'text-gray-500',
  fontMedium: 'font-medium',
  viewButton: 'text-[#0284a5] hover:text-[#026d8a]'
} as const;

const LOADING_CONFIG = {
  duration: 1500,
  skeletonCount: 3,
  tableSkeletonCount: 5
} as const;



const getDefaultStats = (): EarningsStats => ({
  earnings: '0.00',
  purchases: '0',
  activeAssets: '0'
});

const sortTransactions = (transactions: Transaction[], sortConfig: SortConfig): Transaction[] => {
  return [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc'
        ? parseFloat(a.amount) - parseFloat(b.amount)
        : parseFloat(b.amount) - parseFloat(a.amount);
    }
    return 0;
  });
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getEarningsStats = (period: string): EarningsStats => {
  
  return getDefaultStats();
};

const getBadgeColor = (period: string, earnings: string): string => {
  const stats = getEarningsStats(period);
  return parseFloat(stats.earnings) > 1000 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
};


const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_STYLES[status]}`}>
    {capitalizeFirst(status)}
  </span>
);

const StatsCard = ({ title, value, period, percentage, badgeColor, isLoading }: StatsCardProps) => {
  if (isLoading) {
    return (
      <div className={LAYOUT_CLASSES.statsCard}>
        <div className={LAYOUT_CLASSES.statsHeader}>
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className={LAYOUT_CLASSES.statsValue}>
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={LAYOUT_CLASSES.statsCard}>
      <div className={LAYOUT_CLASSES.statsHeader}>
        <h3 className={LAYOUT_CLASSES.statsTitle}>{title}</h3>
        <span className={`${LAYOUT_CLASSES.statsBadge} ${badgeColor}`}>
          {period}
        </span>
      </div>
      <div className={LAYOUT_CLASSES.statsValue}>
        <span className={LAYOUT_CLASSES.statsAmount}>
          {title.includes('Earnings') ? `$${value}` : title.includes('Purchases') ? formatNumber(value) : value}
        </span>
        <span className={LAYOUT_CLASSES.statsPercentage}>{percentage}</span>
      </div>
    </div>
  );
};

const StatsGrid = ({ selectedPeriod, isLoading }: StatsGridProps) => (
  <div className={LAYOUT_CLASSES.statsGrid}>
    {STATS_CONFIG.map((config) => (
      <StatsCard
        key={config.key}
        title={config.title}
        value={getDefaultStats()[config.key as keyof EarningsStats]}
        period={selectedPeriod}
        percentage={config.percentage}
        badgeColor={config.badgeColor}
        isLoading={isLoading}
      />
    ))}
  </div>
);

const Header = ({ selectedPeriod, onPeriodChange, isLoading }: HeaderProps) => (
  <div className={LAYOUT_CLASSES.header}>
    <h1 className={LAYOUT_CLASSES.title}>Earnings Overview</h1>
    {isLoading ? (
      <Skeleton className="w-[200px] h-10 rounded-lg" />
    ) : (
      <Select
        value={selectedPeriod}
        onChange={onPeriodChange}
        options={TIME_PERIODS}
        className={LAYOUT_CLASSES.select}
      />
    )}
  </div>
);

const TableHeader = ({ sortConfig, onSort }: TableHeaderProps) => (
  <thead className={LAYOUT_CLASSES.tableHead}>
    <tr>
      <th
        scope="col"
        className={`${LAYOUT_CLASSES.tableHeaderCell} ${LAYOUT_CLASSES.sortableHeader}`}
        onClick={() => onSort('date')}
      >
        <div className="flex items-center gap-2">
          Date
          {sortConfig.key === 'date' && (
            <svg className={`${LAYOUT_CLASSES.sortIcon} ${
              sortConfig.direction === 'desc' ? 'transform rotate-180' : ''
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </th>
      <th scope="col" className={LAYOUT_CLASSES.tableHeaderCell}>
        <span className="hidden sm:inline">Buyer</span>
      </th>
      <th scope="col" className={LAYOUT_CLASSES.tableHeaderCell}>
        <span className="hidden sm:inline">Asset</span>
      </th>
      <th
        scope="col"
        className={`${LAYOUT_CLASSES.tableHeaderCell} ${LAYOUT_CLASSES.sortableHeader}`}
        onClick={() => onSort('amount')}
      >
        <div className="flex items-center gap-2">
          Amount
          {sortConfig.key === 'amount' && (
            <svg className={`${LAYOUT_CLASSES.sortIcon} ${
              sortConfig.direction === 'desc' ? 'transform rotate-180' : ''
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </div>
      </th>
      <th scope="col" className={LAYOUT_CLASSES.tableHeaderCell}>
        Status
      </th>
      <th scope="col" className="relative px-6 py-3 hidden sm:table-cell">
      </th>
    </tr>
  </thead>
);

const TableRow = ({ transaction }: TableRowProps) => (
  <tr className={LAYOUT_CLASSES.tableRow}>
    <td className={`${LAYOUT_CLASSES.tableCell} ${LAYOUT_CLASSES.textSm} ${LAYOUT_CLASSES.textGray900}`}>
      {formatDate(transaction.date)}
    </td>
    <td className={`${LAYOUT_CLASSES.tableCellHidden}`}>
      <div className={`${LAYOUT_CLASSES.textSm} ${LAYOUT_CLASSES.fontMedium} ${LAYOUT_CLASSES.textGray900}`}>
        {transaction.buyer}
      </div>
    </td>
    <td className={`${LAYOUT_CLASSES.tableCellHidden}`}>
      <div className={`${LAYOUT_CLASSES.textSm} ${LAYOUT_CLASSES.textGray500}`}>
        {transaction.asset}
      </div>
    </td>
    <td className={`${LAYOUT_CLASSES.tableCell} ${LAYOUT_CLASSES.textSm} ${LAYOUT_CLASSES.textGray500}`}>
      ${transaction.amount}
    </td>
    <td className={LAYOUT_CLASSES.tableCell}>
      <StatusBadge status={transaction.status} />
    </td>
    <td className={LAYOUT_CLASSES.tableCellRight}>
      <button className={LAYOUT_CLASSES.viewButton}>
        View
      </button>
    </td>
  </tr>
);

const TransactionTable = ({ transactions, sortConfig, onSort, isLoading }: TransactionTableProps) => (
  <div className={LAYOUT_CLASSES.tableContainer}>
    <div className={LAYOUT_CLASSES.tableHeader}>
      <h2 className={LAYOUT_CLASSES.tableTitle}>Recent Transactions</h2>
    </div>
    <div className={LAYOUT_CLASSES.tableWrapper}>
      <table className={LAYOUT_CLASSES.table}>
        <TableHeader sortConfig={sortConfig} onSort={onSort} />
        <tbody className={LAYOUT_CLASSES.tableBody}>
          {isLoading ? (
            Array.from({ length: LOADING_CONFIG.tableSkeletonCount }).map((_, index) => (
              <tr key={index}>
                <td className={LAYOUT_CLASSES.tableCell}>
                  <Skeleton className="w-24 h-4" />
                </td>
                <td className={LAYOUT_CLASSES.tableCellHidden}>
                  <Skeleton className="w-32 h-4" />
                </td>
                <td className={LAYOUT_CLASSES.tableCellHidden}>
                  <Skeleton className="w-40 h-4" />
                </td>
                <td className={LAYOUT_CLASSES.tableCell}>
                  <Skeleton className="w-16 h-4" />
                </td>
                <td className={LAYOUT_CLASSES.tableCell}>
                  <Skeleton className="w-20 h-6 rounded-full" />
                </td>
                <td className={LAYOUT_CLASSES.tableCellRight}>
                  <Skeleton className="w-12 h-4 ml-auto" />
                </td>
              </tr>
            ))
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} transaction={transaction} />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);


export function EarningsView({ primaryColor }: EarningsViewProps = {}) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'desc'
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  
  const [transactions] = useState<Transaction[]>([]);
  const sortedTransactions = sortTransactions(transactions, sortConfig);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_CONFIG.duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={LAYOUT_CLASSES.container}>
      <Header
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        isLoading={isLoading}
      />

      <StatsGrid
        selectedPeriod={selectedPeriod}
        isLoading={isLoading}
      />

      <TransactionTable
        transactions={sortedTransactions}
        sortConfig={sortConfig}
        onSort={handleSort}
        isLoading={isLoading}
      />
    </div>
  );
}