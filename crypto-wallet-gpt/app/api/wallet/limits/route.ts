import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { applyRateLimit } from '@/lib/security/rateLimit';

/**
 * GET /api/wallet/limits
 * 
 * Returns user's KYC tier information and transaction limits
 * Used by MCP server to provide context to ChatGPT
 */
export async function GET(req: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req, 'default');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        kycTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Define limits based on KYC tier (from PRD and TechDoc)
    const tierLimits = {
      0: {
        tier: 0,
        name: 'Basic',
        description: 'Email verification only',
        dailyLimitUSD: 100,
        perTransactionUSD: 50,
        monthlyLimitUSD: 500,
        requires2FA: false,
        canWithdraw: false,
        features: [
          'Send and receive crypto',
          'Check balances',
          'Transaction history'
        ],
        upgradeRequired: [
          'Withdraw to bank account',
          'Higher transaction limits'
        ]
      },
      1: {
        tier: 1,
        name: 'Verified',
        description: 'Identity verified',
        dailyLimitUSD: 1000,
        perTransactionUSD: 500,
        monthlyLimitUSD: 10000,
        requires2FA: true,
        canWithdraw: true,
        features: [
          'All Basic features',
          'Withdraw to bank account',
          'Higher transaction limits',
          '2FA security'
        ],
        upgradeRequired: [
          'Enhanced limits for large transactions'
        ]
      },
      2: {
        tier: 2,
        name: 'Premium',
        description: 'Enhanced verification',
        dailyLimitUSD: 10000,
        perTransactionUSD: 5000,
        monthlyLimitUSD: 100000,
        requires2FA: true,
        canWithdraw: true,
        features: [
          'All Verified features',
          'Very high transaction limits',
          'Priority support',
          'Advanced security features'
        ],
        upgradeRequired: []
      }
    };

    const userTier = user.kycTier as 0 | 1 | 2;
    const limits = tierLimits[userTier];

    // Calculate usage for the current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTransactions = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'send',
        status: {
          in: ['pending', 'confirmed', 'executing']
        },
        createdAt: {
          gte: today
        }
      },
      _sum: {
        amount: true
      }
    });

    const dailyUsedUSD = Number(dailyTransactions._sum.amount || 0);
    const dailyRemainingUSD = Math.max(0, limits.dailyLimitUSD - dailyUsedUSD);

    // Calculate monthly usage
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyTransactions = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'send',
        status: {
          in: ['pending', 'confirmed', 'executing']
        },
        createdAt: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    const monthlyUsedUSD = Number(monthlyTransactions._sum.amount || 0);
    const monthlyRemainingUSD = Math.max(0, limits.monthlyLimitUSD - monthlyUsedUSD);

    return NextResponse.json({
      success: true,
      kyc: {
        currentTier: userTier,
        tierName: limits.name,
        description: limits.description,
        memberSince: user.createdAt.toISOString().split('T')[0],
      },
      limits: {
        dailyLimitUSD: limits.dailyLimitUSD,
        dailyUsedUSD: Math.round(dailyUsedUSD * 100) / 100,
        dailyRemainingUSD: Math.round(dailyRemainingUSD * 100) / 100,
        monthlyLimitUSD: limits.monthlyLimitUSD,
        monthlyUsedUSD: Math.round(monthlyUsedUSD * 100) / 100,
        monthlyRemainingUSD: Math.round(monthlyRemainingUSD * 100) / 100,
        perTransactionUSD: limits.perTransactionUSD,
      },
      usage: {
        dailyPercentage: Math.round((dailyUsedUSD / limits.dailyLimitUSD) * 100),
        monthlyPercentage: Math.round((monthlyUsedUSD / limits.monthlyLimitUSD) * 100),
        transactionsToday: dailyTransactions._count || 0,
      },
      security: {
        requires2FA: limits.requires2FA,
        canWithdraw: limits.canWithdraw,
      },
      features: limits.features,
      upgradeInfo: {
        nextTier: userTier < 2 ? userTier + 1 : null,
        nextTierName: userTier < 2 ? tierLimits[userTier + 1 as 1 | 2].name : null,
        benefits: limits.upgradeRequired,
      }
    }, {
      headers: rateLimitResult.headers
    });

  } catch (error) {
    console.error('Error fetching limits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

