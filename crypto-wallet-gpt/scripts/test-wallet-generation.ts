/**
 * Test Wallet Generation
 * 
 * Tests the wallet generation service with BIP-39/BIP-44
 */

import { generateEthereumWallet, isValidEthereumAddress } from '../lib/wallet/generator';
import { tripleEncrypt, tripleDecrypt } from '../lib/wallet/encryption';

async function testWalletGeneration() {
  console.log('\n🧪 Testing Wallet Generation...\n');
  
  let totalTests = 0;
  let passed = 0;
  let failed = 0;
  
  // Test 1: Generate wallet
  totalTests++;
  console.log('Test 1: Generate Ethereum wallet');
  try {
    const wallet = await generateEthereumWallet();
    
    if (!wallet.address) {
      throw new Error('No address generated');
    }
    
    if (!wallet.encryptedSeed) {
      throw new Error('No encrypted seed');
    }
    
    if (!isValidEthereumAddress(wallet.address)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    console.log('✅ Wallet generated successfully');
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Blockchain: ${wallet.blockchain}`);
    console.log(`   Encrypted seed length: ${wallet.encryptedSeed.length} chars`);
    passed++;
  } catch (error) {
    console.error('❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    failed++;
  }
  
  // Test 2: Generate multiple wallets (ensure uniqueness)
  totalTests++;
  console.log('\nTest 2: Generate 5 unique wallets');
  try {
    const wallets = await Promise.all([
      generateEthereumWallet(),
      generateEthereumWallet(),
      generateEthereumWallet(),
      generateEthereumWallet(),
      generateEthereumWallet()
    ]);
    
    const addresses = wallets.map(w => w.address);
    const uniqueAddresses = new Set(addresses);
    
    if (uniqueAddresses.size !== addresses.length) {
      throw new Error('Generated duplicate addresses!');
    }
    
    console.log('✅ All 5 wallets are unique');
    passed++;
  } catch (error) {
    console.error('❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    failed++;
  }
  
  // Test 3: Encryption/Decryption round-trip
  totalTests++;
  console.log('\nTest 3: Test encryption/decryption');
  try {
    const testMnemonic = 'test seed phrase that should be encrypted and decrypted correctly';
    
    const encrypted = await tripleEncrypt(testMnemonic);
    if (!encrypted) {
      throw new Error('Encryption failed');
    }
    
    const decrypted = await tripleDecrypt(encrypted);
    if (decrypted !== testMnemonic) {
      throw new Error('Decryption failed - mismatch');
    }
    
    console.log('✅ Encryption/Decryption round-trip successful');
    console.log(`   Original length: ${testMnemonic.length}`);
    console.log(`   Encrypted length: ${encrypted.length}`);
    console.log(`   Decrypted matches: ${decrypted === testMnemonic}`);
    passed++;
  } catch (error) {
    console.error('❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    failed++;
  }
  
  // Test 4: Address format validation
  totalTests++;
  console.log('\nTest 4: Address format validation');
  try {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
    const invalidAddress = '0xinvalid';
    
    if (!isValidEthereumAddress(validAddress)) {
      throw new Error('Valid address rejected');
    }
    
    if (isValidEthereumAddress(invalidAddress)) {
      throw new Error('Invalid address accepted');
    }
    
    console.log('✅ Address validation works correctly');
    passed++;
  } catch (error) {
    console.error('❌ Failed:', error instanceof Error ? error.message : 'Unknown error');
    failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  console.log(`Total: ${totalTests}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(50) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testWalletGeneration().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

