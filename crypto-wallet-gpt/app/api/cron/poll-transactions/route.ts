/**
 * Cron Job: Poll Pending Transactions
 * 
 * Polls blockchain for pending transaction statuses and updates database
 * Can be triggered by Vercel Cron or manually for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { pollAllPendingTransactions } from '@/lib/blockchain/statusPoller';

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for production security
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting transaction status polling...');
    const startTime = Date.now();

    // Poll all pending transactions
    const result = await pollAllPendingTransactions();

    const duration = Date.now() - startTime;
    console.log(`[Cron] Polling completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      updated: result.updated,
      failed: result.failed,
      duration: `${duration}ms`
    });

  } catch (error) {
    console.error('[Cron] Polling failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to poll transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}

