'use client';

/**
 * Transaction List Component
 * 
 * Displays recent transactions with status badges and detail modal
 */

import { useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionDetailModal } from './TransactionDetailModal';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  from?: string;
  to?: string;
  txHash?: string;
  explorerUrl?: string;
  createdAt: Date;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleTransactionClick = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-2">Your transactions will appear here</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      send: '📤',
      receive: '📥',
      buy: '💳',
      sell: '🏦',
      stake: '🔒',
      unstake: '🔓'
    };
    return icons[type as keyof typeof icons] || '💱';
  };

  const truncateAddress = (address?: string) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => handleTransactionClick(tx.id)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              {/* Left: Type and addresses */}
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{getTypeIcon(tx.type)}</span>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                  <div className="text-xs text-gray-500">
                    {tx.type === 'send' && (
                      <span>To: {truncateAddress(tx.to)}</span>
                    )}
                    {tx.type === 'receive' && (
                      <span>From: {truncateAddress(tx.from)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle: Amount */}
              <div className="text-right mx-4">
                <p className={`font-semibold ${tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'}`}>
                  {tx.type === 'receive' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{tx.currency}</p>
              </div>

              {/* Right: Status and date */}
              <div className="text-right">
                <TransactionStatusBadge 
                  status={tx.status} 
                  transactionId={tx.id}
                  autoRefresh={tx.status === 'pending'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showDetailModal}
        transactionId={selectedTransaction}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
      />
    </>
  );
}

