'use client';

/**
 * Add Contact Modal Component
 * 
 * Modal for manually adding a new contact
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { isAddress } from 'ethers';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: () => void;
}

export function AddContactModal({ isOpen, onClose, onContactAdded }: AddContactModalProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate wallet address
    if (!walletAddress || !isAddress(walletAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
          email: email.trim() || undefined,
          nickname: nickname.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add contact');
      }

      // Reset form
      setWalletAddress('');
      setEmail('');
      setNickname('');
      
      // Call callback
      onContactAdded?.();
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setWalletAddress('');
      setEmail('');
      setNickname('');
      setError(null);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Add Contact</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Wallet Address */}
            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address *
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                The recipient's Ethereum wallet address
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Nickname (Optional) */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                Nickname (Optional)
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Mom, Friend, etc."
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                A friendly name to help you remember this contact
              </p>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="small" className="mr-2" />
                    Adding...
                  </span>
                ) : (
                  'Add Contact'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

