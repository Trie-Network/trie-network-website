import { useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  asset: {
    name: string;
    type: 'model' | 'dataset' | 'infra';
    image: string;
  };
  seller: {
    name: string;
    avatar: string;
  };
  amount: string;
  status: 'completed' | 'pending' | 'processing';
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: `tx-${i + 1}`,
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  asset: {
    name: [
      'Advanced NLP Model',
      'Image Classifier Pro',
      'Speech Recognition Engine',
      'Object Detection System',
      'Text Generation Model'
    ][Math.floor(Math.random() * 5)],
    type: ['model', 'dataset', 'infra'][Math.floor(Math.random() * 3)] as 'model' | 'dataset' | 'infra',
    image: 'https://cdn.midjourney.com/d8fdb597-0d88-467d-8637-8022fb31dc1e/0_0.png'
  },
  seller: {
    name: `Seller ${Math.floor(Math.random() * 100)}`,
    avatar: 'S'
  },
  amount: `${(Math.random() * 1000).toFixed(2)}`,
  status: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)] as 'completed' | 'pending' | 'processing'
}));

export const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800'
};

export function useTransactions() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc'
  });

  const totalItems = MOCK_TRANSACTIONS.length;
  const totalPages = Math.ceil(totalItems / 12);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTransactions = [...MOCK_TRANSACTIONS].sort((a, b) => {
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

export type { Transaction };