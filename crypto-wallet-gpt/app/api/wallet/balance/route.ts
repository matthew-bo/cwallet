/**
 * GET /api/wallet/balance
 * 
 * Retrieves wallet balances for ETH and USDC
 * Implements rate limiting and caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { getWalletBalances } from '@/lib/blockchain/balance';
import { applyRateLimit } from '@/lib/security/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'balanceCheck', user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Get blockchain from query params (default: ethereum)
    const { searchParams } = new URL(request.url);
    const blockchain = searchParams.get('blockchain') || 'ethereum';

    // Get wallet for specified blockchain
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId_blockchain: {
          userId: user.id,
          blockchain
        }
      }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: `No ${blockchain} wallet found` },
        { status: 404 }
      );
    }

    // Update last accessed time
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { lastAccessedAt: new Date() }
    });

    // Get balances from blockchain
    const balances = await getWalletBalances(wallet.address);

    // Return formatted response
    return NextResponse.json(
      {
        success: true,
        address: wallet.address,
        blockchain: wallet.blockchain,
        balances: {
          eth: {
            symbol: balances.eth.symbol,
            balance: balances.eth.balance,
            usdValue: balances.eth.usdValue
          },
          usdc: {
            symbol: balances.usdc.symbol,
            balance: balances.usdc.balance,
            usdValue: balances.usdc.usdValue
          }
        },
        totalUSD: balances.totalUSD
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch wallet balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}

