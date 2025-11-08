/**
 * Transaction Validation Service
 * 
 * Validates transaction inputs and checks limits
 */

import { isAddress } from 'ethers';
import { prisma } from '../db/client';

// KYC tier limits (from PRD and TechDoc)
export const KYC_LIMITS = {
  0: {
    dailyLimitUSD: 100,
    perTransactionUSD: 50,
    monthlyLimitUSD: 100,
    requires2FA: false
  },
  1: {
    dailyLimitUSD: 1000,
    perTransactionUSD: 500,
    monthlyLimitUSD: 10000,
    requires2FA: true
  },
  2: {
    dailyLimitUSD: 10000,
    perTransactionUSD: 5000,
    monthlyLimitUSD: 100000,
    requires2FA: true
  }
};

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Validate transaction amount
 */
export function isValidAmount(amount: number): boolean {
  // Must be positive
  if (amount <= 0) {
    return false;
  }
  
  // Max 6 decimal places for USD amounts
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 6) {
    return false;
  }
  
  return true;
}

/**
 * Check if user has reached daily transaction limit
 */
export async function checkDailyLimit(
  userId: string,
  amountUSD: number
): Promise<{ allowed: boolean; message?: string }> {
  // Get user's KYC tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycTier: true }
  });
  
  if (!user) {
    return { allowed: false, message: 'User not found' };
  }
  
  const limits = KYC_LIMITS[user.kycTier as keyof typeof KYC_LIMITS];
  
  // Check per-transaction limit
  if (amountUSD > limits.perTransactionUSD) {
    return {
      allowed: false,
      message: `Transaction amount exceeds limit of $${limits.perTransactionUSD}. Upgrade KYC tier for higher limits.`
    };
  }
  
  // Get today's transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'send',
      status: { in: ['confirmed', 'pending'] },
      createdAt: { gte: today }
    },
    select: { amount: true }
  });
  
  // Calculate total spent today
  const totalToday = transactions.reduce((sum, tx) => {
    return sum + parseFloat(tx.amount.toString());
  }, 0);
  
  // Check if adding this transaction would exceed daily limit
  if (totalToday + amountUSD > limits.dailyLimitUSD) {
    return {
      allowed: false,
      message: `Daily limit of $${limits.dailyLimitUSD} would be exceeded. Remaining: $${(limits.dailyLimitUSD - totalToday).toFixed(2)}`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if user has reached monthly transaction limit
 */
export async function checkMonthlyLimit(
  userId: string,
  amountUSD: number
): Promise<{ allowed: boolean; message?: string }> {
  // Get user's KYC tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycTier: true }
  });
  
  if (!user) {
    return { allowed: false, message: 'User not found' };
  }
  
  const limits = KYC_LIMITS[user.kycTier as keyof typeof KYC_LIMITS];
  
  // Get this month's transactions
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'send',
      status: { in: ['confirmed', 'pending'] },
      createdAt: { gte: firstDayOfMonth }
    },
    select: { amount: true }
  });
  
  // Calculate total spent this month
  const totalMonth = transactions.reduce((sum, tx) => {
    return sum + parseFloat(tx.amount.toString());
  }, 0);
  
  // Check if adding this transaction would exceed monthly limit
  if (totalMonth + amountUSD > limits.monthlyLimitUSD) {
    return {
      allowed: false,
      message: `Monthly limit of $${limits.monthlyLimitUSD} would be exceeded. Remaining: $${(limits.monthlyLimitUSD - totalMonth).toFixed(2)}`
    };
  }
  
  return { allowed: true };
}

/**
 * Check if 2FA is required for this transaction
 */
export async function requires2FA(userId: string, amountUSD: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycTier: true }
  });
  
  if (!user) {
    return false;
  }
  
  const limits = KYC_LIMITS[user.kycTier as keyof typeof KYC_LIMITS];
  
  // Require 2FA if tier requires it OR if amount > $100
  return limits.requires2FA || amountUSD > 100;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Look up wallet address by email
 * Returns null if user not found or has no wallet
 */
export async function getWalletByEmail(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallets: {
        where: { blockchain: 'ethereum' },
        select: { address: true }
      }
    }
  });
  
  if (!user || user.wallets.length === 0) {
    return null;
  }
  
  return user.wallets[0].address;
}

/**
 * Validate recipient (address or email)
 */
export async function validateRecipient(recipient: string): Promise<{
  valid: boolean;
  address?: string;
  message?: string;
}> {
  // Check if it's a valid Ethereum address
  if (isValidEthereumAddress(recipient)) {
    return {
      valid: true,
      address: recipient
    };
  }
  
  // Check if it's a valid email
  if (isValidEmail(recipient)) {
    const address = await getWalletByEmail(recipient);
    if (address) {
      return {
        valid: true,
        address
      };
    } else {
      return {
        valid: false,
        message: 'Recipient email not found or has no wallet'
      };
    }
  }
  
  return {
    valid: false,
    message: 'Invalid recipient address or email'
  };
}

