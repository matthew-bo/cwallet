/**
 * POST /api/wallet/create
 * 
 * Creates a new custodial wallet for the authenticated user
 * - One wallet per user per blockchain
 * - Automatically generated after Google OAuth
 * - Encrypted seed stored in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { generateEthereumWallet } from '@/lib/wallet/generator';
import { applyRateLimit } from '@/lib/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'default');
    if (rateLimitResponse) return rateLimitResponse;

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

    // Check if user already has an Ethereum wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: {
        userId_blockchain: {
          userId: user.id,
          blockchain: 'ethereum'
        }
      }
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          message: 'Wallet already exists',
          wallet: {
            address: existingWallet.address,
            blockchain: existingWallet.blockchain,
            createdAt: existingWallet.createdAt
          }
        },
        { status: 200 }
      );
    }

    // Generate new wallet
    const walletData = await generateEthereumWallet();

    // Store wallet in database
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        blockchain: walletData.blockchain,
        address: walletData.address,
        encryptedSeed: walletData.encryptedSeed,
        kmsKeyId: walletData.kmsKeyId
      }
    });

    // Return public wallet information only
    return NextResponse.json(
      {
        success: true,
        wallet: {
          address: wallet.address,
          blockchain: wallet.blockchain,
          createdAt: wallet.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Wallet creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}

