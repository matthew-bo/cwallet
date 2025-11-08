'use client';

/**
 * Balance Card Component
 * 
 * Displays wallet balance with token breakdown
 */

import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface TokenBalance {
  symbol: string;
  balance: string;
  usdValue?: number;
}

interface BalanceCardProps {
  totalUSD: number;
  eth?: TokenBalance;
  usdc?: TokenBalance;
  loading?: boolean;
}

export function BalanceCard({ totalUSD, eth, usdc, loading }: BalanceCardProps) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Total Balance */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-2">Total Portfolio Value</p>
        <h2 className="text-5xl font-bold text-gray-900">
          ${totalUSD.toFixed(2)}
        </h2>
      </div>

      {/* Token Breakdown */}
      <div className="space-y-4">
        {/* ETH Balance */}
        {eth && (
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{eth.symbol}</p>
              <p className="text-sm text-gray-600">{parseFloat(eth.balance).toFixed(6)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${(eth.usdValue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* USDC Balance */}
        {usdc && (
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">{usdc.symbol}</p>
              <p className="text-sm text-gray-600">{parseFloat(usdc.balance).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ${(usdc.usdValue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 24h Change Placeholder */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          24h Change: <span className="text-green-600">+$0.00 (0.0%)</span> {/* Placeholder for Phase 3 */}
        </p>
      </div>
    </Card>
  );
}

