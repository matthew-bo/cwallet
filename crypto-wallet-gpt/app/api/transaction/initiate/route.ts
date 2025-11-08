/**
 * POST /api/transaction/initiate
 * 
 * Initiates a transaction and generates confirmation token
 * - Validates recipient and amount
 * - Checks KYC limits
 * - Creates pending transaction record
 * - Returns confirmation URL (expires in 10 minutes)
 * - NEVER executes transaction without web confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import {
  isValidAmount,
  checkDailyLimit,
  checkMonthlyLimit,
  requires2FA
} from '@/lib/blockchain/validation';
import { getWalletBalances } from '@/lib/blockchain/balance';
import { estimateGasCostUSD } from '@/lib/blockchain/executor';
import { applyRateLimit } from '@/lib/security/rateLimit';
import { resolveRecipient, saveContact } from '@/lib/contacts/resolver';
import { randomUUID } from 'crypto';

// Confirmation token expires in 10 minutes
const CONFIRMATION_EXPIRY_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
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
    const rateLimitResponse = await applyRateLimit(request, 'transactionInitiate', user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { recipient, amount, currency } = body;

    // Validate required fields
    if (!recipient || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: recipient, amount, currency' },
        { status: 400 }
      );
    }

    // For MVP, only support USDC
    if (currency !== 'USDC') {
      return NextResponse.json(
        { error: 'Only USDC is supported in MVP' },
        { status: 400 }
      );
    }

    // Validate amount
    if (!isValidAmount(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be positive with max 6 decimal places.' },
        { status: 400 }
      );
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        blockchain: 'ethereum'
      }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'No wallet found. Please create a wallet first.' },
        { status: 404 }
      );
    }

    // Resolve recipient (email or address)
    let resolved;
    try {
      resolved = await resolveRecipient(recipient, user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid recipient' },
        { status: 400 }
      );
    }

    const toAddress = resolved.address;

    // Check if sending to self
    if (toAddress.toLowerCase() === wallet.address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot send to your own wallet' },
        { status: 400 }
      );
    }

    // Automatically save contact if this is a new recipient
    if (resolved.isNewRecipient) {
      try {
        await saveContact(
          user.id,
          toAddress,
          resolved.email,
          resolved.nickname,
          resolved.isVerifiedUser
        );
      } catch (error) {
        // Log but don't fail transaction if contact save fails
        console.error('Failed to save contact:', error);
      }
    }

    // Check balance
    const balances = await getWalletBalances(wallet.address);
    const usdcBalance = parseFloat(balances.usdc.balance);
    
    if (usdcBalance < amount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. You have ${usdcBalance.toFixed(2)} USDC, but need ${amount} USDC + gas fees.`
        },
        { status: 400 }
      );
    }

    // Check daily limit
    const dailyCheck = await checkDailyLimit(user.id, amount);
    if (!dailyCheck.allowed) {
      return NextResponse.json(
        { error: dailyCheck.message },
        { status: 403 }
      );
    }

    // Check monthly limit
    const monthlyCheck = await checkMonthlyLimit(user.id, amount);
    if (!monthlyCheck.allowed) {
      return NextResponse.json(
        { error: monthlyCheck.message },
        { status: 403 }
      );
    }

    // Estimate gas fees
    const estimatedGasCost = await estimateGasCostUSD('usdc');

    // Check if 2FA is required
    const needs2FA = await requires2FA(user.id, amount);

    // Generate confirmation token
    const confirmationToken = randomUUID();

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + CONFIRMATION_EXPIRY_MS);

    // Create pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'send',
        status: 'pending',
        amount: amount.toString(),
        currency,
        fromAddress: wallet.address,
        toAddress,
        confirmationToken,
        metadata: {
          estimatedGasCost,
          needs2FA,
          expiresAt: expiresAt.toISOString(),
          recipientEmail: resolved.email,
          recipientNickname: resolved.nickname,
          isNewRecipient: resolved.isNewRecipient,
          isVerifiedUser: resolved.isVerifiedUser
        }
      }
    });

    // Build confirmation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/confirm/${confirmationToken}`;

    // Return response with confirmation URL
    return NextResponse.json(
      {
        success: true,
        transactionId: transaction.id,
        confirmationUrl,
        expiresIn: CONFIRMATION_EXPIRY_MS / 1000, // seconds
        details: {
          from: wallet.address,
          to: toAddress,
          amount,
          currency,
          estimatedGasCost,
          total: amount + estimatedGasCost,
          requires2FA: needs2FA
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Transaction initiation failed:', error);
    return NextResponse.json(
      { error: 'Failed to initiate transaction' },
      { status: 500 }
    );
  }
}

