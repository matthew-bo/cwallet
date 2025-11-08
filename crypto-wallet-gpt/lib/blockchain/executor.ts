/**
 * Transaction Executor Service
 * 
 * Builds, signs, and broadcasts transactions to Ethereum network
 */

import { Contract, parseUnits, TransactionRequest, TransactionResponse } from 'ethers';
import { getProvider, estimateGas, getGasPrice } from './provider';
import { signAndSendTransaction } from './signer';
import { invalidateBalanceCache } from './balance';
import { getNextNonce } from './nonce';
import { prisma } from '../db/client';
import { getETHPriceUSD } from './pricing';

// ERC-20 ABI for transfer function
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// USDC contract addresses
const USDC_ADDRESSES = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

/**
 * Get USDC contract address for current network
 */
function getUSDCAddress(): string {
  const network = process.env.ETHEREUM_NETWORK || 'sepolia';
  return USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
}

/**
 * Execute a USDC transfer transaction
 * 
 * @param userId - User ID from database
 * @param toAddress - Recipient address
 * @param amountUSD - Amount in USD (USDC has 6 decimals)
 * @returns Transaction response
 */
export async function executeUSDCTransfer(
  userId: string,
  toAddress: string,
  amountUSD: number
): Promise<TransactionResponse> {
  try {
    // Get user's wallet
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        blockchain: 'ethereum'
      }
    });
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    // Get USDC contract
    const provider = getProvider();
    const usdcAddress = getUSDCAddress();
    const usdcContract = new Contract(usdcAddress, ERC20_ABI, provider);
    
    // Get decimals and convert amount
    const decimals = await usdcContract.decimals();
    const amount = parseUnits(amountUSD.toString(), decimals);
    
    // Check balance
    const balance = await usdcContract.balanceOf(wallet.address);
    if (balance < amount) {
      throw new Error('Insufficient USDC balance');
    }
    
    // Build transfer transaction
    const data = usdcContract.interface.encodeFunctionData('transfer', [
      toAddress,
      amount
    ]);
    
    // Estimate gas
    const gasLimit = await estimateGas({
      to: usdcAddress,
      from: wallet.address,
      data
    });
    
    // Get gas price
    const gasPrice = await getGasPrice();
    
    // Get next nonce for this user
    const nonce = await getNextNonce(userId, 'ethereum');
    
    // Build transaction request
    const transaction: TransactionRequest = {
      to: usdcAddress,
      data,
      gasLimit: gasLimit * BigInt(120) / BigInt(100), // Add 20% buffer
      gasPrice,
      nonce
    };
    
    // Sign and send transaction
    const txResponse = await signAndSendTransaction(userId, transaction);
    
    // Invalidate balance cache
    await invalidateBalanceCache(wallet.address);
    
    return txResponse;
    
  } catch (error) {
    console.error('USDC transfer failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to execute transfer'
    );
  }
}

/**
 * Execute an ETH transfer transaction
 * 
 * @param userId - User ID from database
 * @param toAddress - Recipient address
 * @param amountETH - Amount in ETH
 * @returns Transaction response
 */
export async function executeETHTransfer(
  userId: string,
  toAddress: string,
  amountETH: number
): Promise<TransactionResponse> {
  try {
    // Get user's wallet
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        blockchain: 'ethereum'
      }
    });
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    // Get provider and check balance
    const provider = getProvider();
    const balance = await provider.getBalance(wallet.address);
    const amount = parseUnits(amountETH.toString(), 18);
    
    if (balance < amount) {
      throw new Error('Insufficient ETH balance');
    }
    
    // Estimate gas
    const gasLimit = await estimateGas({
      to: toAddress,
      from: wallet.address,
      value: amount
    });
    
    // Get gas price
    const gasPrice = await getGasPrice();
    
    // Calculate total cost (amount + gas)
    const totalCost = amount + (gasLimit * gasPrice);
    if (balance < totalCost) {
      throw new Error('Insufficient ETH balance for amount + gas fees');
    }
    
    // Get next nonce for this user
    const nonce = await getNextNonce(userId, 'ethereum');
    
    // Build transaction request
    const transaction: TransactionRequest = {
      to: toAddress,
      value: amount,
      gasLimit: gasLimit * BigInt(120) / BigInt(100), // Add 20% buffer
      gasPrice,
      nonce
    };
    
    // Sign and send transaction
    const txResponse = await signAndSendTransaction(userId, transaction);
    
    // Invalidate balance cache
    await invalidateBalanceCache(wallet.address);
    
    return txResponse;
    
  } catch (error) {
    console.error('ETH transfer failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to execute transfer'
    );
  }
}

/**
 * Estimate gas cost for a transaction in USD
 * 
 * @param transactionType - Type of transaction ('usdc' or 'eth')
 * @returns Estimated gas cost in USD
 */
export async function estimateGasCostUSD(
  transactionType: 'usdc' | 'eth'
): Promise<number> {
  try {
    const gasPrice = await getGasPrice();
    
    // Typical gas limits
    const gasLimits = {
      usdc: BigInt(65000), // ERC-20 transfer
      eth: BigInt(21000)   // ETH transfer
    };
    
    const gasLimit = gasLimits[transactionType];
    const gasCostWei = gasLimit * gasPrice;
    
    // Convert to ETH
    const gasCostETH = Number(gasCostWei) / 1e18;
    
    // Convert to USD using real-time price oracle
    const ethPrice = await getETHPriceUSD();
    const gasCostUSD = gasCostETH * ethPrice;
    
    return parseFloat(gasCostUSD.toFixed(2));
    
  } catch (error) {
    console.error('Failed to estimate gas cost:', error);
    // Return default estimate
    return transactionType === 'usdc' ? 2.0 : 1.0;
  }
}

/**
 * Wait for transaction confirmation
 * 
 * @param txHash - Transaction hash
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @returns Transaction receipt
 */
export async function waitForConfirmation(
  txHash: string,
  confirmations: number = 1
) {
  const provider = getProvider();
  return await provider.waitForTransaction(txHash, confirmations);
}

