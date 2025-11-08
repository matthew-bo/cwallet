'use client';

/**
 * QR Modal Component
 * 
 * Modal for receiving funds with QR code
 */

import { useState } from 'react';
import { Button } from '../ui/Button';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  qrCodeDataURL?: string;
}

export function QRModal({ isOpen, onClose, address, qrCodeDataURL }: QRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncatedAddress = `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Receive Crypto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          {qrCodeDataURL ? (
            <img
              src={qrCodeDataURL}
              alt="Wallet QR Code"
              className="w-64 h-64 border-4 border-gray-200 rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 border-4 border-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Loading QR code...</p>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Your Wallet Address</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-mono text-sm text-gray-900 break-all">
                {address}
              </p>
            </div>
          </div>
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="w-full mt-2"
          >
            {copied ? '✓ Copied!' : '📋 Copy Address'}
          </Button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Warning:</strong> Only send Ethereum assets (ETH, USDC, and other ERC-20 tokens) to this address. 
            Sending other cryptocurrencies will result in permanent loss.
          </p>
        </div>

        {/* Network Info */}
        <p className="text-xs text-gray-500 text-center">
          Network: Ethereum ({process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'Sepolia'})
        </p>
      </div>
    </div>
  );
}

