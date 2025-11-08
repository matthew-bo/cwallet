/**
 * GET /api/wallet/address
 * 
 * Retrieves the user's wallet address(es)
 * Used for receiving funds and displaying QR codes
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
      where: { email: session.user.email },
      include: {
        wallets: {
          select: {
            id: true,
            address: true,
            blockchain: true,
            createdAt: true
          }
        }
      }
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

    // Check if user has any wallets
    if (user.wallets.length === 0) {
      return NextResponse.json(
        {
          message: 'No wallets found',
          wallets: []
        },
        { status: 200 }
      );
    }

    // Return wallet addresses
    return NextResponse.json(
      {
        success: true,
        wallets: user.wallets
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to fetch wallet address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet address' },
      { status: 500 }
    );
  }
}

