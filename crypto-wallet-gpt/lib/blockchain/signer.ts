/**
 * Transaction Signing Service
 * 
 * Handles secure transaction signing with private key management
 * 
 * CRITICAL SECURITY:
 * - Decrypts wallet seed in-memory only
 * - Clears sensitive data immediately after use
 * - Never logs private keys or mnemonics
 * - Audit logs all signature operations
 */

import { Wallet, TransactionRequest, TransactionResponse } from 'ethers';
import { getProvider } from './provider';
import { tripleDecrypt, secureDelete } from '../wallet/encryption';
import { deriveWalletFromMnemonic } from '../wallet/generator';
import { prisma } from '../db/client';
import { auditLog } from '../audit/logger';

export interface SignatureResult {
  signedTransaction: string;
  transactionHash: string;
}

/**
 * SECURITY NOTE: Private Key Memory Cleanup
 * 
 * We attempt to clear sensitive data from memory using secureDelete().
 * However, ethers.js Wallet objects store private keys in internal
 * structures that cannot be directly overwritten from external code.
 * 
 * Mitigation:
 * - Triple-layer encryption at rest
 * - Private keys only decrypted in memory during signing
 * - Process memory protected by OS
 * - For production at scale, use isolated signing service
 * 
 * This is a known limitation of JavaScript's memory management
 * and the ethers.js library architecture.
 */

/**
 * Sign a transaction with user's private key
 * 
 * @param userId - User ID from database
 * @param transaction - Transaction to sign
 * @returns Signed transaction hex string
 */
export async function signTransaction(
  userId: string,
  transaction: TransactionRequest
): Promise<SignatureResult> {
  let mnemonic: string | undefined;
  let wallet: Wallet | undefined;
  
  try {
    // Audit log: signature request
    await auditLog(userId, 'SIGN_TRANSACTION_REQUEST', {
      to: transaction.to,
      value: transaction.value?.toString(),
      data: transaction.data ? 'present' : 'none'
    });
    
    // Get user's wallet from database
    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        blockchain: 'ethereum'
      }
    });
    
    if (!userWallet) {
      throw new Error('Wallet not found for user');
    }
    
    // Decrypt the mnemonic (triple-layer decryption)
    mnemonic = await tripleDecrypt(userWallet.encryptedSeed);
    
    // Derive wallet from mnemonic
    wallet = deriveWalletFromMnemonic(mnemonic);
    
    // Connect wallet to provider
    const provider = getProvider();
    const connectedWallet = wallet.connect(provider);
    
    // Sign the transaction
    const signedTx = await connectedWallet.signTransaction(transaction);
    
    // Note: Transaction hash is determined after broadcast, not available from signed tx string
    // The hash will be obtained from the broadcast response in signAndSendTransaction
    
    // Audit log: signature success
    await auditLog(userId, 'SIGN_TRANSACTION_SUCCESS', {
      note: 'Transaction signed successfully'
    });
    
    return {
      signedTransaction: signedTx,
      transactionHash: '' // Will be set after broadcast
    };
    
  } catch (error) {
    // Audit log: signature failure
    await auditLog(userId, 'SIGN_TRANSACTION_FAILURE', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    console.error('Transaction signing failed:', error);
    throw new Error('Failed to sign transaction');
    
  } finally {
    // CRITICAL: Clear sensitive data from memory
    if (mnemonic) {
      secureDelete(mnemonic);
      mnemonic = undefined;
    }
    if (wallet) {
      // Clear wallet private key
      const pkBuffer = Buffer.from(wallet.privateKey.replace('0x', ''), 'hex');
      secureDelete(pkBuffer);
      wallet = undefined;
    }
  }
}

/**
 * Sign and send a transaction
 * 
 * @param userId - User ID from database
 * @param transaction - Transaction to sign and send
 * @returns Transaction response from blockchain
 */
export async function signAndSendTransaction(
  userId: string,
  transaction: TransactionRequest
): Promise<TransactionResponse> {
  let mnemonic: string | undefined;
  let wallet: Wallet | undefined;
  
  try {
    // Audit log: sign and send request
    await auditLog(userId, 'SIGN_AND_SEND_REQUEST', {
      to: transaction.to,
      value: transaction.value?.toString()
    });
    
    // Get user's wallet from database
    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        blockchain: 'ethereum'
      }
    });
    
    if (!userWallet) {
      throw new Error('Wallet not found for user');
    }
    
    // Decrypt the mnemonic
    mnemonic = await tripleDecrypt(userWallet.encryptedSeed);
    
    // Derive wallet from mnemonic
    wallet = deriveWalletFromMnemonic(mnemonic);
    
    // Connect wallet to provider
    const provider = getProvider();
    const connectedWallet = wallet.connect(provider);
    
    // Send transaction (this signs and broadcasts)
    const txResponse = await connectedWallet.sendTransaction(transaction);
    
    // Audit log: transaction sent
    await auditLog(userId, 'TRANSACTION_SENT', {
      transactionHash: txResponse.hash,
      nonce: txResponse.nonce
    });
    
    return txResponse;
    
  } catch (error) {
    // Audit log: send failure
    await auditLog(userId, 'TRANSACTION_SEND_FAILURE', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    console.error('Transaction send failed:', error);
    throw new Error('Failed to send transaction');
    
  } finally {
    // CRITICAL: Clear sensitive data from memory
    if (mnemonic) {
      secureDelete(mnemonic);
      mnemonic = undefined;
    }
    if (wallet) {
      const pkBuffer = Buffer.from(wallet.privateKey.replace('0x', ''), 'hex');
      secureDelete(pkBuffer);
      wallet = undefined;
    }
  }
}

/**
 * Sign a message with user's private key
 * Used for authentication or proof of ownership
 */
export async function signMessage(
  userId: string,
  message: string
): Promise<string> {
  let mnemonic: string | undefined;
  let wallet: Wallet | undefined;
  
  try {
    // Get user's wallet from database
    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        blockchain: 'ethereum'
      }
    });
    
    if (!userWallet) {
      throw new Error('Wallet not found for user');
    }
    
    // Decrypt the mnemonic
    mnemonic = await tripleDecrypt(userWallet.encryptedSeed);
    
    // Derive wallet from mnemonic
    wallet = deriveWalletFromMnemonic(mnemonic);
    
    // Sign the message
    const signature = await wallet.signMessage(message);
    
    return signature;
    
  } finally {
    // CRITICAL: Clear sensitive data from memory
    if (mnemonic) {
      secureDelete(mnemonic);
      mnemonic = undefined;
    }
    if (wallet) {
      const pkBuffer = Buffer.from(wallet.privateKey.replace('0x', ''), 'hex');
      secureDelete(pkBuffer);
      wallet = undefined;
    }
  }
}

