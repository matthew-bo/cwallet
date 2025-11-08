/**
 * POST /api/transaction/execute
 * 
 * Executes a confirmed transaction
 * - Verifies confirmation token is valid and not expired
 * - Checks transaction is in pending status
 * - Signs and broadcasts transaction to Ethereum network
 * - Updates transaction record with blockchain hash
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { executeUSDCTransfer } from '@/lib/blockchain/executor';
import { applyRateLimit } from '@/lib/security/rateLimit';

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
    const rateLimitResponse = await applyRateLimit(request, 'transactionExecute', user.id);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { confirmationToken, confirmed } = body;

    // Validate required fields
    if (!confirmationToken || confirmed !== true) {
      return NextResponse.json(
        { error: 'Invalid confirmation' },
        { status: 400 }
      );
    }

    // Get transaction by confirmation token
    const transaction = await prisma.transaction.findUnique({
      where: { confirmationToken },
      include: {
        user: true
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
        { error: 'Unauthorized to execute this transaction' },
        { status: 403 }
      );
    }

    // Check transaction status
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Transaction already ${transaction.status}`,
          status: transaction.status,
          txHash: transaction.blockchainTxHash
        },
        { status: 400 }
      );
    }

    // Check if token is expired (10 minutes)
    const metadata = transaction.metadata as any;
    if (metadata?.expiresAt) {
      const expiresAt = new Date(metadata.expiresAt);
      if (expiresAt < new Date()) {
        // Mark as cancelled
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'cancelled' }
        });
        
        return NextResponse.json(
          { error: 'Confirmation token expired' },
          { status: 400 }
        );
      }
    }

    // Execute the transaction based on currency
    let txResponse;
    const amount = parseFloat(transaction.amount.toString());

    try {
      if (transaction.currency === 'USDC') {
        txResponse = await executeUSDCTransfer(
          transaction.userId,
          transaction.toAddress!,
          amount
        );
      } else {
        throw new Error(`Unsupported currency: ${transaction.currency}`);
      }
    } catch (execError) {
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          failedAt: new Date(),
          metadata: {
            ...metadata,
            error: execError instanceof Error ? execError.message : 'Unknown error'
          }
        }
      });

      return NextResponse.json(
        {
          error: 'Transaction execution failed',
          details: execError instanceof Error ? execError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Update transaction record with blockchain hash
    // Note: Status is set to 'pending' after broadcast.
    // A background job should poll for blockchain confirmation
    // and update to 'confirmed' after 1+ confirmations.
    // For MVP, users can check status manually via block explorer.
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'pending', // Transaction broadcast but not confirmed on blockchain
        blockchainTxHash: txResponse.hash,
        executedAt: new Date(),
        metadata: {
          ...metadata,
          nonce: txResponse.nonce,
          gasPrice: txResponse.gasPrice?.toString(),
          gasLimit: txResponse.gasLimit?.toString()
        }
      }
    });

    // Get explorer URL
    const network = process.env.ETHEREUM_NETWORK || 'sepolia';
    const explorerBaseUrl = network === 'mainnet' 
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io';
    const explorerUrl = `${explorerBaseUrl}/tx/${txResponse.hash}`;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        transactionId: updatedTransaction.id,
        txHash: txResponse.hash,
        explorerUrl,
        status: 'pending',
        message: 'Transaction broadcast successfully! It will be confirmed in ~30 seconds. Check status via block explorer.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Transaction execution failed:', error);
    return NextResponse.json(
      { error: 'Failed to execute transaction' },
      { status: 500 }
    );
  }
}

