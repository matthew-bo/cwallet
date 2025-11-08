/**
 * Secure Wallet Generation Service
 * 
 * Generates HD wallets using BIP-39 (mnemonic) and BIP-44 (key derivation)
 * 
 * Security:
 * - Uses crypto.getRandomValues() for entropy
 * - Generates 24-word mnemonics (256 bits entropy)
 * - Derives keys using standard BIP-44 paths
 * - Encrypts mnemonics before storage
 * - NEVER returns private keys or mnemonics to API
 */

import * as bip39 from 'bip39';
import { HDNodeWallet, Wallet } from 'ethers';
import { tripleEncrypt, secureDelete } from './encryption';

// BIP-44 derivation paths
const ETHEREUM_PATH = "m/44'/60'/0'/0/0"; // Standard Ethereum path

export interface WalletGenerationResult {
  address: string;
  blockchain: string;
  encryptedSeed: string;
  kmsKeyId: string;
}

/**
 * Generate a new Ethereum wallet with BIP-39 mnemonic
 * 
 * @returns Wallet details with encrypted seed
 */
export async function generateEthereumWallet(): Promise<WalletGenerationResult> {
  let mnemonic: string | undefined;
  let privateKey: string | undefined;
  
  try {
    // Generate 24-word mnemonic (256 bits of entropy)
    mnemonic = bip39.generateMnemonic(256);
    
    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Generated invalid mnemonic');
    }
    
    // Create HD wallet from mnemonic
    const hdWallet = HDNodeWallet.fromPhrase(mnemonic);
    
    // Derive Ethereum address using BIP-44 path
    const derivedWallet = hdWallet.derivePath(ETHEREUM_PATH);
    privateKey = derivedWallet.privateKey;
    
    // Get public address
    const address = derivedWallet.address;
    
    // Encrypt the mnemonic (triple-layer encryption)
    const encryptedSeed = await tripleEncrypt(mnemonic);
    
    // Return only public information
    return {
      address,
      blockchain: 'ethereum',
      encryptedSeed,
      kmsKeyId: process.env.GOOGLE_KMS_KEY || 'wallet-key'
    };
    
  } catch (error) {
    console.error('Wallet generation failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to generate wallet');
  } finally {
    // CRITICAL: Clear sensitive data from memory
    if (mnemonic) {
      secureDelete(mnemonic);
      mnemonic = undefined;
    }
    if (privateKey) {
      const pkBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
      secureDelete(pkBuffer);
      privateKey = undefined;
    }
  }
}

/**
 * Validate an Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Derive Ethereum wallet from mnemonic (for transaction signing)
 * 
 * WARNING: This function returns sensitive data. Use only in signing service.
 * Must be called in secure context with immediate cleanup.
 * 
 * @param mnemonic - The BIP-39 mnemonic phrase
 * @returns Wallet instance (MUST be cleared after use)
 */
export function deriveWalletFromMnemonic(mnemonic: string): Wallet {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }
  
  // Create HD wallet and derive using BIP-44 path
  const hdWallet = HDNodeWallet.fromPhrase(mnemonic);
  const derivedWallet = hdWallet.derivePath(ETHEREUM_PATH);
  
  // Return as Wallet instance for signing
  return new Wallet(derivedWallet.privateKey);
}

/**
 * Test wallet generation (for development only)
 * Generates multiple wallets to verify correctness
 */
export async function testWalletGeneration(count: number = 5): Promise<void> {
  console.log(`\nTesting wallet generation (${count} wallets)...\n`);
  
  for (let i = 0; i < count; i++) {
    try {
      const wallet = await generateEthereumWallet();
      console.log(`Wallet ${i + 1}:`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Blockchain: ${wallet.blockchain}`);
      console.log(`  Encrypted: ${wallet.encryptedSeed.substring(0, 50)}...`);
      console.log(`  Valid address: ${isValidEthereumAddress(wallet.address)}`);
      console.log('');
    } catch (error) {
      console.error(`Failed to generate wallet ${i + 1}:`, error);
    }
  }
}

