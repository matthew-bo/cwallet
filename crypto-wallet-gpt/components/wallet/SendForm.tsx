'use client';

/**
 * Send Transaction Form Component
 * 
 * Form for initiating send transactions
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ContactSelector } from './ContactSelector';

interface SendFormProps {
  usdcBalance: number;
  onSuccess?: (confirmationUrl: string) => void;
}

export function SendForm({ usdcBalance, onSuccess }: SendFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!recipient || !amount) {
        throw new Error('Please fill in all fields');
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amountNum > usdcBalance) {
        throw new Error(`Insufficient balance. You have ${usdcBalance.toFixed(2)} USDC`);
      }

      // Call initiate transaction API
      const response = await fetch('/api/transaction/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          amount: amountNum,
          currency: 'USDC'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate transaction');
      }

      // Show success and open confirmation URL
      alert('Transaction prepared! Opening confirmation page...');
      
      if (onSuccess) {
        onSuccess(data.confirmationUrl);
      } else {
        window.open(data.confirmationUrl, '_blank');
      }

      // Reset form
      setRecipient('');
      setAmount('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate transaction');
    } finally {
      setLoading(false);
    }
  };

  const estimatedTotal = amount ? (parseFloat(amount) + 2.0).toFixed(2) : '0.00';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipient Field */}
      <div>
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
          Recipient
        </label>
        <ContactSelector
          value={recipient}
          onChange={setRecipient}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter an email address or Ethereum address (starting with 0x)
        </p>
      </div>

      {/* Amount Field */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount (USDC)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            max={usdcBalance}
            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Available: ${usdcBalance.toFixed(2)} USDC</span>
          <button
            type="button"
            onClick={() => setAmount(usdcBalance.toString())}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Max
          </button>
        </div>
      </div>

      {/* Fee Breakdown */}
      {amount && parseFloat(amount) > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="text-gray-900">${parseFloat(amount).toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Network Fee (est):</span>
            <span className="text-gray-900">~$2.00</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-300">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">${estimatedTotal}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner size="small" className="mr-2" />
            Preparing Transaction...
          </span>
        ) : (
          'Send USDC →'
        )}
      </Button>

      {/* Info Note */}
      <p className="text-xs text-gray-500 text-center">
        You will be asked to confirm this transaction on a secure page
      </p>
    </form>
  );
}

