import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/formatNumber';
import { getNetworkColor } from '../../config/colors';
import { Pagination, Skeleton } from '@/components/ui';
import { useNavigate } from 'react-router-dom';


interface MyUploadsViewProps {
  primaryColor?: string;
  compId?: string;
}

interface UploadItem {
  id: string;
  type: 'AI Model' | 'Dataset' | 'Infrastructure';
  name: string;
  category: string;
  status: 'Active' | 'Pending Review' | 'Inactive';
  downloads: string;
  earnings: string;
  updatedAt: string;
}

interface Stats {
  totalAssets: number;
  totalPurchases: number;
  totalEarnings: number;
}

interface StatCardProps {
  value: string | number;
  label: string;
  primaryColor: string;
}

interface TableHeaderProps {
  headers: string[];
}

interface TableRowProps {
  item: UploadItem;
  primaryColor: string;
  onEdit: (item: UploadItem) => void;
}

interface LoadingSkeletonProps {
  rows: number;
}

interface HeaderProps {
  isLoading: boolean;
  stats: Stats;
  primaryColor: string;
}


const ITEMS_PER_PAGE = 15;
const LOADING_DURATION = 1500;
const EARNINGS_PER_DOWNLOAD = 0.1;


const TABLE_HEADERS = [
  'Type',
  'Name',
  'Category',
  'Downloads',
  'Pricing',
  'Last Updated'
];

const STORAGE_KEYS = {
  USER_MODELS: 'user_models',
  USER_DATASETS: 'user_uploads_datasets',
  USER_INFRA: 'user_uploads_infra'
} as const;

const LAYOUT_CLASSES = {
  container: 'h-[calc(100vh-112px)] pt-6 pb-16 overflow-y-auto scrollbar-hide',
  wrapper: 'max-w-6xl mx-auto',
  header: 'flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8 px-4 animate-fadeIn',
  headerContent: 'flex-shrink-0',
  title: 'text-2xl font-bold text-gray-900',
  subtitle: 'mt-1 text-sm text-gray-500',
  statsGrid: 'grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-6',
  statCard: 'bg-white p-4 rounded-xl border border-[#e1e3e5] text-center hover:shadow-lg transition-all duration-300 group',
  statValue: 'text-xl sm:text-2xl font-bold text-gray-900 transition-colors',
  statLabel: 'text-xs sm:text-sm text-gray-500 whitespace-nowrap mt-1',
  tableContainer: 'bg-white rounded-xl border border-[#e1e3e5] overflow-hidden mx-4',
  tableWrapper: 'overflow-x-auto',
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeader: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap',
  tableCellText: 'text-sm font-medium text-gray-900',
  tableCellSecondary: 'text-sm text-gray-500',
  typeBadge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
  editButton: 'hover:underline'
} as const;

const ANIMATION_CONFIG = {
  fadeIn: 'animate-fadeIn',
  hoverTransition: 'transition-all duration-300'
} as const;


const getCardHoverStyles = (primaryColor: string): React.CSSProperties => {
  return {
    border: `1px solid ${primaryColor}`,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
  };
};

const getTextHoverStyles = (primaryColor: string): React.CSSProperties => {
  return {
    color: primaryColor
  };
};

const getEditButtonStyles = (primaryColor: string): React.CSSProperties => {
  return {
    color: primaryColor
  };
};

const getEditButtonHoverStyles = (primaryColor: string): React.CSSProperties => {
  return {
    color: `${primaryColor}dd`
  };
};

const calculateStats = (): Stats => {
  const models = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MODELS) || '[]');
  const datasets = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATASETS) || '[]');
  const infra = localStorage.getItem(STORAGE_KEYS.USER_INFRA) === 'true' ? 1 : 0;

  const totalAssets = models.length + datasets.length + infra;
  const totalPurchases = models.reduce((acc: number, model: any) => acc + parseInt(model.downloads || '0'), 0);
  const totalEarnings = models.reduce((acc: number, model: any) => acc + (parseInt(model.downloads || '0') * EARNINGS_PER_DOWNLOAD), 0);

  return {
    totalAssets,
    totalPurchases,
    totalEarnings
  };
};

const getEditPath = (itemType: UploadItem['type']): string => {
  switch (itemType) {
    case 'AI Model':
      return '/dashboard/upload/model';
    case 'Dataset':
      return '/dashboard/upload/dataset';
    case 'Infrastructure':
      return '/dashboard/upload/infra';
    default:
      return '/dashboard/upload';
  }
};

const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, primaryColor: string, isHovering: boolean): void => {
  if (isHovering) {
    Object.assign(e.currentTarget.style, getCardHoverStyles(primaryColor));
    e.currentTarget.querySelector('.stat-value')?.setAttribute('style', `color:${primaryColor}`);
  } else {
    e.currentTarget.style.border = '1px solid #e1e3e5';
    e.currentTarget.style.boxShadow = '';
    e.currentTarget.querySelector('.stat-value')?.setAttribute('style', 'color:#111827');
  }
};


const StatCard: React.FC<StatCardProps> = ({ value, label, primaryColor }) => {
  return (
    <div
      className={LAYOUT_CLASSES.statCard}
      onMouseOver={(e) => handleCardHover(e, primaryColor, true)}
      onMouseOut={(e) => handleCardHover(e, primaryColor, false)}
    >
      <div className="flex flex-col items-center">
        <div className={`${LAYOUT_CLASSES.statValue} stat-value`}>
          {typeof value === 'number' ? formatNumber(value.toString()) : value}
        </div>
        <div className={LAYOUT_CLASSES.statLabel}>{label}</div>
      </div>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ headers }) => {
  return (
    <thead className={LAYOUT_CLASSES.tableHead}>
      <tr>
        {headers.map((header, index) => (
          <th key={index} scope="col" className={LAYOUT_CLASSES.tableHeader}>
            {header}
          </th>
        ))}
        <th scope="col" className="relative px-6 py-3">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );
};

const TableRow: React.FC<TableRowProps> = ({ item, primaryColor, onEdit }) => {
  return (
    <tr key={item.id} className={LAYOUT_CLASSES.tableRow}>
      <td className={LAYOUT_CLASSES.tableCell}>
        <span className={LAYOUT_CLASSES.typeBadge}>
          {item.type}
        </span>
      </td>
      <td className={LAYOUT_CLASSES.tableCell}>
        <div className={LAYOUT_CLASSES.tableCellText}>{item.name}</div>
      </td>
      <td className={LAYOUT_CLASSES.tableCell}>
        <div className={LAYOUT_CLASSES.tableCellSecondary}>{item.category}</div>
      </td>
      <td className={`${LAYOUT_CLASSES.tableCell} ${LAYOUT_CLASSES.tableCellSecondary}`}>
        {item.downloads}
      </td>
      <td className={`${LAYOUT_CLASSES.tableCell} ${LAYOUT_CLASSES.tableCellSecondary}`}>
        {item.earnings}
      </td>
      <td className={`${LAYOUT_CLASSES.tableCell} ${LAYOUT_CLASSES.tableCellSecondary}`}>
        {item.updatedAt}
      </td>
      <td className={`${LAYOUT_CLASSES.tableCell} text-right text-sm font-medium`}>
        <button
          onClick={() => onEdit(item)}
          style={getEditButtonStyles(primaryColor)}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, getEditButtonHoverStyles(primaryColor))}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, getEditButtonStyles(primaryColor))}
          className={LAYOUT_CLASSES.editButton}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-24 h-6 rounded-full" />
          </td>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-48 h-4" />
          </td>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-32 h-4" />
          </td>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-16 h-4" />
          </td>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-20 h-4" />
          </td>
          <td className={LAYOUT_CLASSES.tableCell}>
            <Skeleton className="w-24 h-4" />
          </td>
          <td className={`${LAYOUT_CLASSES.tableCell} text-right`}>
            <Skeleton className="w-12 h-4 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
};

const Header: React.FC<HeaderProps> = ({ isLoading, stats, primaryColor }) => {
  if (isLoading) {
    return (
      <>
        <div className={LAYOUT_CLASSES.headerContent}>
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-64 h-4" />
        </div>
        <div className={LAYOUT_CLASSES.statsGrid}>
          <Skeleton className="w-32 h-16" />
          <Skeleton className="w-32 h-16" />
          <Skeleton className="w-32 h-16" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={LAYOUT_CLASSES.headerContent}>
        <h1 className={LAYOUT_CLASSES.title}>My Uploads</h1>
        <p className={LAYOUT_CLASSES.subtitle}>
          Access your purchased AI models, datasets, and infrastructure services
        </p>
      </div>
      <div className={LAYOUT_CLASSES.statsGrid}>
        <StatCard value={stats.totalAssets} label="Total Assets" primaryColor={primaryColor} />
        <StatCard value={formatNumber(stats.totalPurchases.toString())} label="Total Purchases" primaryColor={primaryColor} />
        <StatCard value={`$${formatNumber(stats.totalEarnings.toString())}`} label="Total Earnings" primaryColor={primaryColor} />
      </div>
    </>
  );
};


export function MyUploadsView({ primaryColor = getNetworkColor(), compId }: MyUploadsViewProps = {}) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadData, setUploadData] = useState<UploadItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    totalPurchases: 0,
    totalEarnings: 0
  });

  useEffect(() => {
   
    setUploadData([]);
  }, []);

  const totalPages = Math.ceil(uploadData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = uploadData.slice(startIndex, startIndex + ITEMS_PER_PAGE);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setStats(calculateStats());
  }, []);

  const handleEdit = (item: UploadItem) => {
    const editPath = getEditPath(item.type);
    navigate(editPath, {
      state: {
        editMode: true,
        modelData: item
      }
    });
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      <div className={LAYOUT_CLASSES.wrapper}>
        <div className={LAYOUT_CLASSES.header}>
          <Header isLoading={isLoading} stats={stats} primaryColor={primaryColor} />
        </div>

        <div className={LAYOUT_CLASSES.tableContainer}>
          <div className={LAYOUT_CLASSES.tableWrapper}>
            <table className={LAYOUT_CLASSES.table}>
              <TableHeader headers={TABLE_HEADERS} />
              <tbody className={LAYOUT_CLASSES.tableBody}>
                {isLoading ? (
                  <LoadingSkeleton rows={5} />
                ) : (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      item={item}
                      primaryColor={primaryColor}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>


          {totalPages > 1 && uploadData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={uploadData.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}