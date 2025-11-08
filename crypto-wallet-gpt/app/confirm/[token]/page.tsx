'use client';

/**
 * Transaction Confirmation Page
 * 
 * Secure confirmation interface for transactions
 * - Displays transaction details
 * - Security checkboxes
 * - 10-second countdown before enabling confirm button
 * - Mobile responsive
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { TransactionReceipt } from '@/components/wallet/TransactionReceipt';

interface TransactionDetails {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  from: string;
  to: string;
  metadata?: {
    estimatedGasCost?: number;
    needs2FA?: boolean;
    expiresAt?: string;
    recipientEmail?: string;
    recipientNickname?: string;
    isNewRecipient?: boolean;
    isVerifiedUser?: boolean;
  };
}

export default function ConfirmTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [checkboxes, setCheckboxes] = useState({
    verifiedAddress: false,
    understandFinal: false
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Fetch transaction details
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transaction/details?token=${token}`);
        if (!response.ok) {
          throw new Error('Transaction not found or expired');
        }
        const data = await response.json();
        setTransaction(data.transaction);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCheckboxChange = (name: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const canConfirm = 
    checkboxes.verifiedAddress && 
    checkboxes.understandFinal && 
    countdown === 0 &&
    !executing;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setExecuting(true);
    setError(null);

    try {
      const response = await fetch('/api/transaction/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationToken: token,
          confirmed: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute transaction');
      }

      // Show receipt
      setTransactionHash(data.txHash);
      setShowReceipt(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute transaction');
      setExecuting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this transaction?')) {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <ErrorMessage message={error || 'Transaction not found'} />
          <Button
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            className="w-full mt-4"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const estimatedGas = transaction.metadata?.estimatedGasCost || 0;
  const total = parseFloat(transaction.amount) + estimatedGas;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Confirm Transaction</h1>
          <p className="text-gray-600 mt-2">🔒 Secure Transaction Confirmation</p>
        </div>

        {/* Transaction Details Card */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">From</span>
              <span className="font-mono text-sm">{transaction.from.substring(0, 10)}...{transaction.from.substring(transaction.from.length - 8)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">To</span>
              <span className="font-mono text-sm">{transaction.to.substring(0, 10)}...{transaction.to.substring(transaction.to.length - 8)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-semibold">Amount</span>
              <span className="text-2xl font-bold text-gray-900">${transaction.amount} {transaction.currency}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 text-sm">Network Fee</span>
              <span className="text-sm text-gray-700">~${estimatedGas.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-4">
              <span className="text-gray-900 font-semibold">Total</span>
              <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-gray-600 text-sm">Estimated Arrival</span>
              <span className="text-sm text-gray-700">~30 seconds ⏱️</span>
            </div>
          </div>
        </Card>

        {/* Security Checks Card */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Security Confirmation</h2>
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkboxes.verifiedAddress}
                onChange={() => handleCheckboxChange('verifiedAddress')}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">
                I have verified the recipient address is correct
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkboxes.understandFinal}
                onChange={() => handleCheckboxChange('understandFinal')}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">
                I understand this transaction cannot be reversed
              </span>
            </label>
          </div>

          {/* Warnings */}
          <div className="mt-6 space-y-3">
            {/* New Recipient Warning */}
            {transaction.metadata?.isNewRecipient && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  ⚠️ <strong>First Time Sending:</strong> This is your first time sending to this address. Please verify it carefully!
                </p>
              </div>
            )}

            {/* Large Amount Warning */}
            {parseFloat(transaction.amount) > 50 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  🛑 <strong>Large Transaction:</strong> You are sending more than $50. Please verify the recipient address carefully.
                </p>
              </div>
            )}

            {/* General Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> Cryptocurrency transactions are irreversible. 
                Please double-check all details before confirming.
              </p>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-6 sm:pb-0">
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex-1 py-4 sm:py-2 text-base sm:text-sm"
            disabled={executing}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            variant="primary"
            className="flex-1 py-4 sm:py-2 text-base sm:text-sm"
            disabled={!canConfirm}
          >
            {executing ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="small" className="mr-2" />
                Processing...
              </span>
            ) : countdown > 0 ? (
              `Please wait ${countdown}s...`
            ) : !checkboxes.verifiedAddress || !checkboxes.understandFinal ? (
              'Check boxes above'
            ) : (
              '✓ Confirm & Send'
            )}
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          This transaction will be processed on the {process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'Sepolia testnet'} network
        </p>
      </div>

      {/* Transaction Receipt Modal */}
      {transaction && (
        <TransactionReceipt
          isOpen={showReceipt}
          transactionHash={transactionHash}
          amount={transaction.amount}
          currency={transaction.currency}
          toAddress={transaction.to}
          timestamp={new Date().toISOString()}
          onClose={() => {
            setShowReceipt(false);
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
}

