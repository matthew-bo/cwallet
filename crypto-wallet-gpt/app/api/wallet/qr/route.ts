/**
 * GET /api/wallet/qr
 * 
 * Generates a QR code for the user's wallet address
 * Used for easy receiving of crypto funds
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import QRCode from 'qrcode';
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

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(wallet.address, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    // Return QR code and address
    return NextResponse.json(
      {
        success: true,
        address: wallet.address,
        blockchain: wallet.blockchain,
        qrCode: qrCodeDataURL
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

