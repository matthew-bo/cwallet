'use client';

/**
 * Transaction Status Badge Component
 * 
 * Shows animated status badge with auto-refresh for pending transactions
 */

import { useState, useEffect } from 'react';

interface TransactionStatusBadgeProps {
  status: string;
  transactionId?: string;
  confirmations?: number;
  autoRefresh?: boolean;
}

export function TransactionStatusBadge({
  status,
  transactionId,
  confirmations = 0,
  autoRefresh = false
}: TransactionStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentConfirmations, setCurrentConfirmations] = useState(confirmations);

  // Auto-refresh pending transactions
  useEffect(() => {
    if (!autoRefresh || !transactionId || currentStatus !== 'pending') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transaction/status/${transactionId}`);
        const data = await response.json();

        if (data.success && data.transaction) {
          setCurrentStatus(data.transaction.status);
          if (data.transaction.metadata?.confirmations) {
            setCurrentConfirmations(data.transaction.metadata.confirmations);
          }
        }
      } catch (error) {
        console.error('Failed to refresh transaction status:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, transactionId, currentStatus]);

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'pending':
        return {
          text: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '⏳',
          animate: true
        };
      case 'confirmed':
        return {
          text: 'Confirmed',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: '✓',
          animate: false
        };
      case 'failed':
        return {
          text: 'Failed',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: '✗',
          animate: false
        };
      case 'cancelled':
        return {
          text: 'Cancelled',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '○',
          animate: false
        };
      default:
        return {
          text: currentStatus,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '○',
          animate: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color} ${
        config.animate ? 'animate-pulse' : ''
      }`}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {currentStatus === 'confirmed' && currentConfirmations > 0 && (
        <span className="text-xs opacity-75">
          ({currentConfirmations}/2)
        </span>
      )}
    </span>
  );
}

