/**
 * GET /api/transaction/history
 * 
 * Get transaction history for authenticated user
 * Supports pagination with offset and limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
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
    const rateLimitResponse = await applyRateLimit(request, 'default', user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Optional filter by type

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Build query filters
    const where: any = { userId: user.id };
    if (type) {
      where.type = type;
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          status: true,
          amount: true,
          currency: true,
          fromAddress: true,
          toAddress: true,
          blockchainTxHash: true,
          createdAt: true,
          confirmedAt: true,
          executedAt: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    // Build explorer URLs
    const network = process.env.ETHEREUM_NETWORK || 'sepolia';
    const explorerBaseUrl = network === 'mainnet' 
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io';

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: tx.amount.toString(),
      currency: tx.currency,
      from: tx.fromAddress,
      to: tx.toAddress,
      txHash: tx.blockchainTxHash,
      explorerUrl: tx.blockchainTxHash 
        ? `${explorerBaseUrl}/tx/${tx.blockchainTxHash}`
        : null,
      createdAt: tx.createdAt,
      confirmedAt: tx.confirmedAt,
      executedAt: tx.executedAt
    }));

    // Return paginated results
    return NextResponse.json(
      {
        success: true,
        transactions: formattedTransactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}

