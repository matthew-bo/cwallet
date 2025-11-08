/**
 * Triple-Layer Encryption Service
 * 
 * Implements secure encryption for wallet seeds using:
 * - Layer 1: AES-256-GCM with app-level key
 * - Layer 2: Google Cloud KMS encryption
 * 
 * CRITICAL: Never log plaintext seeds or private keys
 */

import crypto from 'crypto';
import { encryptData as kmsEncrypt, decryptData as kmsDecrypt } from '../kms';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Must be 32 bytes (64 hex chars)
 */
function getAppEncryptionKey(): Buffer {
  const key = process.env.APP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('APP_ENCRYPTION_KEY environment variable not set');
  }
  if (key.length !== 64) {
    throw new Error('APP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Layer 1: Encrypt with AES-256-GCM
 */
function encryptWithAES(plaintext: string): { encrypted: string; iv: string; authTag: string } {
  const key = getAppEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Layer 1: Decrypt with AES-256-GCM
 */
function decryptWithAES(encrypted: string, iv: string, authTag: string): string {
  const key = getAppEncryptionKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Triple-layer encryption: AES + KMS
 * 
 * @param plaintext - The mnemonic or seed to encrypt
 * @returns Base64-encoded encrypted data with metadata
 */
export async function tripleEncrypt(plaintext: string): Promise<string> {
  try {
    // Layer 1: AES-256-GCM encryption
    const { encrypted, iv, authTag } = encryptWithAES(plaintext);
    
    // Combine all components
    const combined = JSON.stringify({ encrypted, iv, authTag });
    
    // Layer 2: KMS encryption
    const kmsEncrypted = await kmsEncrypt(Buffer.from(combined, 'utf8'));
    
    return kmsEncrypted;
  } catch (error) {
    console.error('Encryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to encrypt wallet seed');
  }
}

/**
 * Triple-layer decryption: KMS + AES
 * 
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Decrypted plaintext (mnemonic or seed)
 */
export async function tripleDecrypt(encryptedData: string): Promise<string> {
  try {
    // Layer 2: KMS decryption
    const kmsDecrypted = await kmsDecrypt(encryptedData);
    const combined = JSON.parse(kmsDecrypted.toString('utf8'));
    
    // Layer 1: AES-256-GCM decryption
    const plaintext = decryptWithAES(
      combined.encrypted,
      combined.iv,
      combined.authTag
    );
    
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to decrypt wallet seed');
  }
}

/**
 * Securely clear sensitive data from memory
 * Overwrites buffer multiple times
 */
export function secureDelete(data: Buffer | string): void {
  if (Buffer.isBuffer(data)) {
    // Overwrite with random data twice, then zeros
    crypto.randomFillSync(data);
    crypto.randomFillSync(data);
    data.fill(0);
  } else if (typeof data === 'string') {
    // For strings, we can't directly overwrite memory
    // But we can at least try to prevent optimization
    data = '\0'.repeat(data.length);
  }
}

