'use client';

/**
 * Transaction Detail Modal Component
 * 
 * Shows full transaction details with live status updates
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  blockchainTxHash?: string;
  createdAt: string;
  confirmedAt?: string;
  executedAt?: string;
  metadata?: any;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  transactionId: string | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  isOpen,
  transactionId,
  onClose
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetails();
    }
  }, [isOpen, transactionId]);

  const fetchTransactionDetails = async () => {
    if (!transactionId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transaction/status/${transactionId}`);
      const data = await response.json();

      if (data.success && data.transaction) {
        setTransaction(data.transaction);
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExplorerUrl = (txHash: string) => {
    const network = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'sepolia';
    const baseUrl = network === 'mainnet' 
      ? 'https://etherscan.io' 
      : `https://${network}.etherscan.io`;
    return `${baseUrl}/tx/${txHash}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="large" />
              </div>
            ) : transaction ? (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <TransactionStatusBadge
                    status={transaction.status}
                    transactionId={transaction.id}
                    confirmations={transaction.metadata?.confirmations}
                    autoRefresh={transaction.status === 'pending'}
                  />
                </div>

                {/* Type & Amount */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {transaction.type === 'send' ? '📤 Sent' : '📥 Received'}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.currency}
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {transaction.fromAddress && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">From</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono break-all">
                        {transaction.fromAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.fromAddress!)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {transaction.toAddress && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">To</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono break-all">
                        {transaction.toAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.toAddress!)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction Hash */}
                {transaction.blockchainTxHash && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Transaction Hash</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded font-mono break-all">
                        {transaction.blockchainTxHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.blockchainTxHash!)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        📋
                      </button>
                    </div>
                    <a
                      href={getExplorerUrl(transaction.blockchainTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      View on Etherscan →
                    </a>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {transaction.confirmedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="text-gray-900">
                        {new Date(transaction.confirmedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gas Info */}
                {transaction.metadata?.gasUsed && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">Gas Details</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gas Used</span>
                        <span className="text-gray-900">{transaction.metadata.gasUsed}</span>
                      </div>
                      {transaction.metadata.estimatedGasCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gas Cost</span>
                          <span className="text-gray-900">
                            ${transaction.metadata.estimatedGasCost.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Transaction not found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

