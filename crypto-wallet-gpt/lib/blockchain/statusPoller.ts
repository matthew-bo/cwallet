/**
 * Transaction Status Poller
 * 
 * Polls blockchain for transaction confirmations and updates database
 */

import { prisma } from '@/lib/db/client';
import { getProvider } from './provider';
import { auditLog } from '../audit/logger';

/**
 * Poll a single transaction and update its status
 */
export async function pollTransactionStatus(transactionId: string): Promise<boolean> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || !transaction.blockchainTxHash) {
      return false;
    }

    // Skip if already confirmed
    if (transaction.status === 'confirmed' || transaction.status === 'failed') {
      return true;
    }

    // Get transaction receipt from blockchain
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(transaction.blockchainTxHash);

    if (!receipt) {
      // Transaction not yet mined
      return false;
    }

    // Check if transaction succeeded or failed
    const status = receipt.status === 1 ? 'confirmed' : 'failed';
    
    // Get current block number to calculate confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = receipt.blockNumber ? currentBlock - receipt.blockNumber + 1 : 0;

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        confirmedAt: status === 'confirmed' ? new Date() : undefined,
        failedAt: status === 'failed' ? new Date() : undefined,
        metadata: {
          ...(typeof transaction.metadata === 'object' ? transaction.metadata : {}),
          blockNumber: receipt.blockNumber,
          confirmations,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : undefined
        }
      }
    });

    // Log audit
    await auditLog(
      transaction.userId,
      `TRANSACTION_${status.toUpperCase()}`,
      {
        transactionId: transaction.id,
        txHash: transaction.blockchainTxHash,
        confirmations,
        status
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to poll transaction status:', error);
    return false;
  }
}

/**
 * Poll all pending transactions
 */
export async function pollAllPendingTransactions(): Promise<{ updated: number; failed: number }> {
  let updated = 0;
  let failed = 0;

  try {
    // Get all pending transactions with blockchain tx hash
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: 'pending',
        blockchainTxHash: { not: null }
      },
      take: 50 // Limit to avoid overwhelming the system
    });

    console.log(`Polling ${pendingTransactions.length} pending transactions...`);

    // Poll each transaction
    for (const transaction of pendingTransactions) {
      try {
        const success = await pollTransactionStatus(transaction.id);
        if (success) {
          updated++;
        }
      } catch (error) {
        console.error(`Failed to poll transaction ${transaction.id}:`, error);
        failed++;
      }
    }

    console.log(`Polling complete: ${updated} updated, ${failed} failed`);

    return { updated, failed };
  } catch (error) {
    console.error('Failed to poll pending transactions:', error);
    return { updated, failed };
  }
}

/**
 * Get transaction status with live blockchain data
 */
export async function getTransactionStatus(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If transaction has blockchain hash and is pending, check blockchain
    if (transaction.blockchainTxHash && transaction.status === 'pending') {
      const provider = getProvider();
      const receipt = await provider.getTransactionReceipt(transaction.blockchainTxHash);

      if (receipt) {
        const currentBlock = await provider.getBlockNumber();
        const confirmations = receipt.blockNumber ? currentBlock - receipt.blockNumber + 1 : 0;

        return {
          ...transaction,
          liveStatus: receipt.status === 1 ? 'confirmed' : 'failed',
          confirmations
        };
      }
    }

    return {
      ...transaction,
      confirmations: 0
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    throw error;
  }
}

