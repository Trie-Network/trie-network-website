import { useState, useMemo, useCallback } from 'react';


export interface Transaction {
  readonly id: string;
  readonly date: string;
  readonly asset: {
    readonly name: string;
    readonly type: 'model' | 'dataset' | 'infra';
    readonly image: string;
  };
  readonly seller: {
    readonly name: string;
    readonly avatar: string;
  };
  readonly amount: string;
  readonly status: 'completed' | 'pending' | 'processing';
}

interface UseTransactionsResult {
  readonly transactions: Transaction[];
  readonly selectedTransaction: Transaction | null;
  readonly setSelectedTransaction: (transaction: Transaction | null) => void;
  readonly sortConfig: {
    readonly key: string;
    readonly direction: 'asc' | 'desc';
  };
  readonly handleSort: (key: string) => void;
  readonly currentPage: number;
  readonly setCurrentPage: (page: number) => void;
  readonly totalItems: number;
  readonly totalPages: number;
}


export const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800'
} as const;


const sortTransactions = (transactions: Transaction[], key: string, direction: 'asc' | 'desc'): Transaction[] => {
  return [...transactions].sort((a, b) => {
    if (key === 'date') {
      return direction === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (key === 'amount') {
      return direction === 'asc'
        ? parseFloat(a.amount) - parseFloat(b.amount)
        : parseFloat(b.amount) - parseFloat(a.amount);
    }
    return 0;
  });
};


export function useTransactions(itemsPerPage = 12): UseTransactionsResult {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc'
  });

 
  const transactions: Transaction[] = [];


  const sortedTransactions = useMemo(() => {
    return sortTransactions(transactions, sortConfig.key, sortConfig.direction);
  }, [sortConfig.key, sortConfig.direction]);

  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
    transactions: sortedTransactions,
    selectedTransaction,
    setSelectedTransaction,
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages
  };
}


export function useTransactionsWithOptions(options: { itemsPerPage?: number } = {}): UseTransactionsResult {
  return useTransactions(options.itemsPerPage);
}


export type { UseTransactionsResult };