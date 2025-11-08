'use client';

/**
 * Dashboard Client Component
 * 
 * Handles all client-side wallet functionality
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { QRModal } from '@/components/wallet/QRModal';
import { TransactionList } from '@/components/wallet/TransactionList';
import { SendForm } from '@/components/wallet/SendForm';
import { ContactsList } from '@/components/contacts/ContactsList';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

interface DashboardClientProps {
  userName?: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [qrModal, setQRModal] = useState(false);
  const [qrData, setQRData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'transactions'>('send');
  const [showWelcome, setShowWelcome] = useState(false);

  // Initialize wallet
  useEffect(() => {
    initializeWallet();
  }, []);

  // Check if user has seen welcome modal
  useEffect(() => {
    if (wallet && typeof window !== 'undefined') {
      const hasSeenWelcome = localStorage.getItem('wallet_welcome_seen');
      if (!hasSeenWelcome) {
        // Small delay to ensure wallet is fully loaded
        setTimeout(() => setShowWelcome(true), 500);
      }
    }
  }, [wallet]);

  const initializeWallet = async () => {
    try {
      // Check if wallet exists
      const walletRes = await fetch('/api/wallet/address');
      const walletData = await walletRes.json();

      if (walletData.wallets && walletData.wallets.length > 0) {
        setWallet(walletData.wallets[0]);
        await fetchBalance();
        await fetchTransactions();
      } else {
        // Auto-create wallet
        await createWallet();
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    setCreatingWallet(true);
    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success || data.wallet) {
        setWallet(data.wallet);
        await fetchBalance();
        alert('✅ Wallet created successfully!');
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet. Please try again.');
    } finally {
      setCreatingWallet(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();
      if (data.success) {
        setBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transaction/history?limit=10');
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleOpenQR = async () => {
    try {
      const response = await fetch('/api/wallet/qr');
      const data = await response.json();
      if (data.success) {
        setQRData(data.qrCode);
        setQRModal(true);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const handleSendSuccess = (confirmationUrl: string) => {
    window.open(confirmationUrl, '_blank');
    // Refresh after a delay
    setTimeout(() => {
      fetchBalance();
      fetchTransactions();
    }, 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet && !creatingWallet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Wallet Found</h2>
          <p className="text-gray-600 mb-6">Create your wallet to get started</p>
          <Button onClick={createWallet} variant="primary">
            Create Wallet
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{userName ? `, ${userName}` : ''}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your crypto wallet and transactions
        </p>
      </div>

      {/* Wallet Address Bar */}
      {wallet && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Wallet Address</p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                {truncateAddress(wallet.address)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                variant="secondary"
                size="small"
              >
                📋 Copy
              </Button>
              <Button
                onClick={handleOpenQR}
                variant="secondary"
                size="small"
              >
                📱 QR Code
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Balance and Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <BalanceCard
            totalUSD={balance?.totalUSD || 0}
            eth={balance?.balances?.eth}
            usdc={balance?.balances?.usdc}
            loading={!balance}
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('send')}
                className={`px-4 py-3 font-medium ${
                  activeTab === 'send'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📤 Send
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-3 font-medium ${
                  activeTab === 'transactions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 History
              </button>
            </div>

            {activeTab === 'send' ? (
              <SendForm
                usdcBalance={balance?.balances?.usdc ? parseFloat(balance.balances.usdc.balance) : 0}
                onSuccess={handleSendSuccess}
              />
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <TransactionList transactions={transactions} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="mb-8">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Contacts</h2>
            <Button
              onClick={() => router.push('/contacts')}
              variant="secondary"
              size="small"
            >
              View All →
            </Button>
          </div>
          <ContactsList limit={5} />
        </Card>
      </div>

      {/* Status Info */}
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Phase 3 In Progress!</h3>
            <p className="text-green-800 text-sm">
              Your wallet now supports email-based sending and contact management. Send to email addresses and they'll be automatically saved!
            </p>
          </div>
        </div>
      </Card>

      {/* QR Modal */}
      {wallet && (
        <QRModal
          isOpen={qrModal}
          onClose={() => setQRModal(false)}
          address={wallet.address}
          qrCodeDataURL={qrData}
        />
      )}

      {/* Welcome Modal */}
      {wallet && (
        <WelcomeModal
          isOpen={showWelcome}
          walletAddress={wallet.address}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}

