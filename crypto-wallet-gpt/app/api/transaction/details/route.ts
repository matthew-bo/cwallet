/**
 * GET /api/transaction/details?token={confirmationToken}
 * 
 * Get transaction details by confirmation token
 * Used by confirmation page to display transaction info
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { applyRateLimit } from '@/lib/security/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (IP-based, no auth required)
    const rateLimitResponse = await applyRateLimit(request, 'default');
    if (rateLimitResponse) return rateLimitResponse;

    // Get confirmation token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing confirmation token' },
        { status: 400 }
      );
    }

    // Get transaction by confirmation token
    const transaction = await prisma.transaction.findUnique({
      where: { confirmationToken: token }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or expired' },
        { status: 404 }
      );
    }

    // Check if transaction is still pending
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Transaction already ${transaction.status}`,
          status: transaction.status
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    const metadata = transaction.metadata as any;
    if (metadata?.expiresAt) {
      const expiresAt = new Date(metadata.expiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Confirmation token expired' },
          { status: 400 }
        );
      }
    }

    // Return transaction details (without sensitive data)
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
          metadata: metadata
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch transaction details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction details' },
      { status: 500 }
    );
  }
}

