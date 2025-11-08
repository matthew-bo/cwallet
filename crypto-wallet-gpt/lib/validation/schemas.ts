/**
 * Zod Validation Schemas
 * 
 * Input validation for all API endpoints
 */

import { z } from 'zod';

/**
 * Ethereum address validation
 */
export const ethereumAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Email validation
 */
export const emailSchema = z.string()
  .email('Invalid email address');

/**
 * Amount validation (USD/crypto)
 */
export const amountSchema = z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount too large')
  .refine((val) => {
    const decimalPlaces = val.toString().split('.')[1]?.length || 0;
    return decimalPlaces <= 6;
  }, 'Maximum 6 decimal places allowed');

/**
 * Currency validation (MVP: USDC only)
 */
export const currencySchema = z.enum(['USDC', 'ETH'], {
  message: 'Only USDC and ETH are supported'
});

/**
 * Transaction initiation schema
 */
export const transactionInitiateSchema = z.object({
  recipient: z.string()
    .min(1, 'Recipient is required')
    .refine((val) => {
      // Check if it's either a valid email or Ethereum address
      const isEmail = z.string().email().safeParse(val).success;
      const isAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/).safeParse(val).success;
      return isEmail || isAddress;
    }, 'Recipient must be a valid email or Ethereum address'),
  amount: amountSchema,
  currency: currencySchema
});

/**
 * Transaction execution schema
 */
export const transactionExecuteSchema = z.object({
  confirmationToken: z.string().uuid('Invalid confirmation token'),
  confirmed: z.literal(true, 'Transaction must be confirmed'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits').optional()
});

/**
 * Wallet creation schema
 */
export const walletCreateSchema = z.object({
  blockchain: z.enum(['ethereum'], {
    message: 'Only Ethereum is supported'
  }).optional()
});

/**
 * Transaction history query schema
 */
export const transactionHistorySchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  type: z.enum(['send', 'receive', 'buy', 'sell', 'stake', 'unstake']).optional()
});

/**
 * Balance query schema
 */
export const balanceQuerySchema = z.object({
  blockchain: z.enum(['ethereum']).default('ethereum')
});

/**
 * Transaction metadata schema
 */
export const transactionMetadataSchema = z.object({
  estimatedGasCost: z.number().optional(),
  needs2FA: z.boolean().optional(),
  expiresAt: z.string().optional(),
  nonce: z.number().optional(),
  gasPrice: z.string().optional(),
  gasLimit: z.string().optional(),
  error: z.string().optional()
});

/**
 * Helper to validate and parse request body
 */
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Get first error message
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError.message
  };
}

/**
 * Helper to validate query parameters
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, any>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Get first error message
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError.message
  };
}

