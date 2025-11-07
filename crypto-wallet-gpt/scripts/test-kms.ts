/**
 * KMS Connection Test Script
 * Validates that Google Cloud KMS is configured correctly
 * 
 * Run with: npx tsx scripts/test-kms.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })
// Fallback to .env if .env.local doesn't exist
config({ path: resolve(__dirname, '../.env') })

import { encryptData, decryptData, testKMSConnection } from '../lib/kms'

async function main() {
  console.log('🔐 Testing Google Cloud KMS Connection...\n')

  try {
    // Test 1: Environment variables
    console.log('1️⃣  Checking environment variables...')
    const requiredVars = [
      'GOOGLE_KMS_PROJECT',
      'GOOGLE_KMS_LOCATION',
      'GOOGLE_KMS_KEYRING',
      'GOOGLE_KMS_KEY',
      'GOOGLE_APPLICATION_CREDENTIALS_JSON'
    ]

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`   ❌ Missing: ${varName}`)
        process.exit(1)
      }
    }
    console.log('   ✅ All environment variables present\n')

    // Test 2: Basic encryption/decryption
    console.log('2️⃣  Testing encryption/decryption...')
    const testString = 'Hello, Crypto Wallet! This is a test of KMS encryption.'
    const testBuffer = Buffer.from(testString, 'utf-8')

    console.log(`   Original: "${testString}"`)
    
    const encrypted = await encryptData(testBuffer)
    console.log(`   Encrypted (base64): ${encrypted.substring(0, 50)}...`)
    
    const decrypted = await decryptData(encrypted)
    const decryptedString = decrypted.toString('utf-8')
    console.log(`   Decrypted: "${decryptedString}"`)

    if (testString === decryptedString) {
      console.log('   ✅ Encryption/decryption successful\n')
    } else {
      console.error('   ❌ Decrypted data does not match original')
      process.exit(1)
    }

    // Test 3: Connection test function
    console.log('3️⃣  Testing KMS connection function...')
    const connectionTest = await testKMSConnection()
    
    if (connectionTest) {
      console.log('   ✅ KMS connection test passed\n')
    } else {
      console.error('   ❌ KMS connection test failed')
      process.exit(1)
    }

    // Test 4: Multiple encrypt/decrypt cycles
    console.log('4️⃣  Testing multiple encryption cycles...')
    const testData = [
      'sensitive-data-1',
      'wallet-seed-phrase-test',
      'private-key-simulation'
    ]

    for (const data of testData) {
      const buffer = Buffer.from(data)
      const enc = await encryptData(buffer)
      const dec = await decryptData(enc)
      
      if (!buffer.equals(dec)) {
        console.error(`   ❌ Failed for: ${data}`)
        process.exit(1)
      }
    }
    console.log('   ✅ All encryption cycles successful\n')

    console.log('🎉 All KMS tests passed! Google Cloud KMS is configured correctly.')
    console.log('\nYou can now proceed with Phase 1 implementation.')

  } catch (error) {
    console.error('\n❌ KMS Test Failed:')
    console.error(error instanceof Error ? error.message : 'Unknown error')
    console.error('\nPlease check:')
    console.error('  1. Google Cloud KMS API is enabled')
    console.error('  2. Service account has "Cloud KMS CryptoKey Encrypter/Decrypter" role')
    console.error('  3. Key ring and crypto key exist in Google Cloud Console')
    console.error('  4. Environment variables are correctly set in .env.local')
    process.exit(1)
  }
}

main()

