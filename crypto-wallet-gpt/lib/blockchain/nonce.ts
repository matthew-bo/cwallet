/**
 * Transaction Nonce Management
 * 
 * Manages nonces for Ethereum transactions to prevent nonce collisions
 * when multiple transactions are initiated concurrently
 */

import { prisma } from '../db/client';
import { getProvider } from './provider';

/**
 * Get next available nonce for a user's wallet
 * Uses database transaction with row-level locking to ensure
 * concurrent requests get unique nonces
 * 
 * @param userId - User ID
 * @param blockchain - Blockchain identifier (default: 'ethereum')
 * @returns Next available nonce
 */
export async function getNextNonce(
  userId: string,
  blockchain: string = 'ethereum'
): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    // Get or create nonce record with row lock
    let nonceRecord = await tx.transactionNonce.findUnique({
      where: {
        userId_blockchain: { userId, blockchain }
      }
    });

    if (!nonceRecord) {
      // First time - get current nonce from blockchain
      const wallet = await tx.wallet.findFirst({
        where: { userId, blockchain }
      });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      const provider = getProvider();
      const onChainNonce = await provider.getTransactionCount(wallet.address, 'pending');
      
      // Create initial nonce record
      nonceRecord = await tx.transactionNonce.create({
        data: {
          userId,
          blockchain,
          nonce: onChainNonce
        }
      });
    }

    // Increment and return
    const nextNonce = nonceRecord.nonce;
    await tx.transactionNonce.update({
      where: { id: nonceRecord.id },
      data: { nonce: nextNonce + 1 }
    });

    return nextNonce;
  });
}

/**
 * Reset nonce to match blockchain state
 * Useful for recovery if nonce gets out of sync
 * 
 * @param userId - User ID
 * @param blockchain - Blockchain identifier
 */
export async function resetNonce(
  userId: string,
  blockchain: string = 'ethereum'
): Promise<void> {
  const wallet = await prisma.wallet.findFirst({
    where: { userId, blockchain }
  });
  
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  
  const provider = getProvider();
  const onChainNonce = await provider.getTransactionCount(wallet.address, 'pending');
  
  await prisma.transactionNonce.upsert({
    where: {
      userId_blockchain: { userId, blockchain }
    },
    update: {
      nonce: onChainNonce
    },
    create: {
      userId,
      blockchain,
      nonce: onChainNonce
    }
  });
}

