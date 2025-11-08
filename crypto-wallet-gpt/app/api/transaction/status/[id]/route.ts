/**
 * GET /api/transaction/status/[id]
 * 
 * Get transaction status by ID
 * Returns current status and blockchain confirmation info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { getTransaction } from '@/lib/blockchain/provider';
import { applyRateLimit } from '@/lib/security/rateLimit';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user for rate limiting
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
    const rateLimitResponse = await applyRateLimit(request, 'default', user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const params = await context.params;
    const { id } = params;

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user owns this transaction
    if (transaction.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If transaction has blockchain hash, check confirmation status
    let confirmations = 0;
    if (transaction.blockchainTxHash) {
      try {
        const blockchainTx = await getTransaction(transaction.blockchainTxHash);
        if (blockchainTx && blockchainTx.blockNumber) {
          const provider = (await import('@/lib/blockchain/provider')).getProvider();
          const currentBlock = await provider.getBlockNumber();
          confirmations = currentBlock - blockchainTx.blockNumber + 1;
        }
      } catch (error) {
        console.error('Failed to get blockchain confirmation:', error);
      }
    }

    // Build explorer URL
    const network = process.env.ETHEREUM_NETWORK || 'sepolia';
    const explorerBaseUrl = network === 'mainnet' 
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io';
    const explorerUrl = transaction.blockchainTxHash
      ? `${explorerBaseUrl}/tx/${transaction.blockchainTxHash}`
      : null;

    // Return transaction status
    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transaction.id,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount.toString(),
          currency: transaction.currency,
          from: transaction.fromAddress,
          to: transaction.toAddress,
          txHash: transaction.blockchainTxHash,
          explorerUrl,
          confirmations,
          createdAt: transaction.createdAt,
          confirmedAt: transaction.confirmedAt,
          executedAt: transaction.executedAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction status' },
      { status: 500 }
    );
  }
}

