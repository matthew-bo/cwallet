'use client';

/**
 * Welcome Modal Component
 * 
 * Shows first-time users an introduction to the wallet
 */

import { useState } from 'react';
import { Button } from '../ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  walletAddress?: string;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, walletAddress, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '👋 Welcome to Your Crypto Wallet!',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your secure wallet has been created! You can now send and receive USDC (a stablecoin worth $1 USD).
          </p>
          <p className="text-gray-700">
            This wallet is <span className="font-semibold">custodial</span>, which means we securely manage your private keys for you.
          </p>
        </div>
      )
    },
    {
      title: '📬 Your Wallet Address',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            This is your unique wallet address. Share it with anyone who wants to send you money:
          </p>
          {walletAddress && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm break-all font-mono">
                {walletAddress}
              </code>
            </div>
          )}
          <p className="text-sm text-gray-600">
            💡 You can also send money using email addresses of other users!
          </p>
        </div>
      )
    },
    {
      title: '📤 Sending Money',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            To send money:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Enter the recipient's email or wallet address</li>
            <li>Enter the amount in USDC</li>
            <li>Review the transaction details</li>
            <li>Confirm the transaction on the secure confirmation page</li>
          </ol>
          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <p className="text-sm text-blue-800">
              <strong>Security Note:</strong> Always verify the recipient address before confirming!
            </p>
          </div>
        </div>
      )
    },
    {
      title: '📥 Receiving Money',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            To receive money:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Share your wallet address with the sender</li>
            <li>Or show them your QR code</li>
            <li>The funds will appear in your wallet automatically</li>
          </ol>
          <p className="text-sm text-gray-600 mt-4">
            💡 Click the "QR Code" button on your dashboard to show your QR code!
          </p>
        </div>
      )
    },
    {
      title: '✅ You\'re All Set!',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            You're ready to start using your crypto wallet! Here are some things you can do:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Send USDC to anyone</li>
            <li>✓ Receive USDC from anyone</li>
            <li>✓ Save contacts for quick sending</li>
            <li>✓ View your transaction history</li>
          </ul>
          <div className="bg-green-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-green-800">
              <strong>Need Help?</strong> Visit the Help Center from the dashboard or contact support.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to localStorage that user has seen welcome
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_welcome_seen', 'true');
      }
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_welcome_seen', 'true');
    }
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </h2>
            {/* Progress Indicator */}
            <div className="flex gap-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStepData.content}
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-3 p-6 border-t border-gray-200">
            <div>
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Skip tutorial
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button onClick={handlePrev} variant="secondary">
                  ← Previous
                </Button>
              )}
              <Button onClick={handleNext} variant="primary">
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

