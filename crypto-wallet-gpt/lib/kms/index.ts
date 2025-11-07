/**
 * Google Cloud KMS Encryption Wrapper
 * Provides secure encryption/decryption for sensitive wallet data
 * 
 * SECURITY NOTE: This module handles encryption of private keys.
 * - All encryption/decryption happens server-side only
 * - Keys are never logged or exposed in error messages
 * - Credentials loaded from environment variables
 */

import { KeyManagementServiceClient } from '@google-cloud/kms'

// Initialize KMS client with credentials from environment
const getKMSClient = () => {
  try {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    
    if (!credentialsJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set')
    }

    const credentials = JSON.parse(credentialsJson)
    
    return new KeyManagementServiceClient({
      credentials,
      projectId: credentials.project_id
    })
  } catch (error) {
    console.error('Failed to initialize KMS client:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('KMS initialization failed')
  }
}

// Get the full KMS key name
const getKeyName = (): string => {
  const project = process.env.GOOGLE_KMS_PROJECT
  const location = process.env.GOOGLE_KMS_LOCATION || 'global'
  const keyRing = process.env.GOOGLE_KMS_KEYRING
  const key = process.env.GOOGLE_KMS_KEY

  if (!project || !keyRing || !key) {
    throw new Error('Missing required KMS environment variables')
  }

  return `projects/${project}/locations/${location}/keyRings/${keyRing}/cryptoKeys/${key}`
}

/**
 * Encrypt data using Google Cloud KMS
 * @param plaintext - Buffer containing data to encrypt
 * @returns Base64-encoded encrypted ciphertext
 */
export async function encryptData(plaintext: Buffer): Promise<string> {
  try {
    const client = getKMSClient()
    const keyName = getKeyName()

    const [result] = await client.encrypt({
      name: keyName,
      plaintext: plaintext,
    })

    if (!result.ciphertext) {
      throw new Error('KMS encryption returned no ciphertext')
    }

    // Convert to base64 for storage
    return Buffer.from(result.ciphertext).toString('base64')
  } catch (error) {
    console.error('KMS encryption failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt data using Google Cloud KMS
 * @param ciphertext - Base64-encoded encrypted data
 * @returns Buffer containing decrypted plaintext
 */
export async function decryptData(ciphertext: string): Promise<Buffer> {
  try {
    const client = getKMSClient()
    const keyName = getKeyName()

    // Convert from base64
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64')

    const [result] = await client.decrypt({
      name: keyName,
      ciphertext: ciphertextBuffer,
    })

    if (!result.plaintext) {
      throw new Error('KMS decryption returned no plaintext')
    }

    return Buffer.from(result.plaintext)
  } catch (error) {
    console.error('KMS decryption failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Test KMS connection and functionality
 * @returns true if KMS is working correctly
 */
export async function testKMSConnection(): Promise<boolean> {
  try {
    const testData = Buffer.from('test-crypto-wallet-kms-connection')
    const encrypted = await encryptData(testData)
    const decrypted = await decryptData(encrypted)
    
    return testData.equals(decrypted)
  } catch (error) {
    console.error('KMS connection test failed:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

