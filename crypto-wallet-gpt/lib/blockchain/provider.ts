/**
 * Blockchain Provider Service
 * 
 * Manages connections to Ethereum network via Infura
 * Supports Sepolia testnet and mainnet
 */

import { ethers, JsonRpcProvider } from 'ethers';

// Network configuration
export type NetworkType = 'sepolia' | 'mainnet';

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

/**
 * Get network configuration
 */
function getNetworkConfig(): NetworkConfig {
  const network = (process.env.ETHEREUM_NETWORK || 'sepolia') as NetworkType;
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  
  if (!infuraProjectId) {
    throw new Error('INFURA_PROJECT_ID environment variable not set');
  }
  
  const configs: Record<NetworkType, NetworkConfig> = {
    sepolia: {
      name: 'sepolia',
      chainId: 11155111,
      rpcUrl: `https://sepolia.infura.io/v3/${infuraProjectId}`,
      explorerUrl: 'https://sepolia.etherscan.io'
    },
    mainnet: {
      name: 'mainnet',
      chainId: 1,
      rpcUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
      explorerUrl: 'https://etherscan.io'
    }
  };
  
  return configs[network];
}

/**
 * Get Ethereum provider instance
 * Singleton pattern to reuse connection
 */
let providerInstance: JsonRpcProvider | null = null;

export function getProvider(): JsonRpcProvider {
  if (!providerInstance) {
    const config = getNetworkConfig();
    providerInstance = new ethers.JsonRpcProvider(config.rpcUrl, {
      name: config.name,
      chainId: config.chainId
    });
  }
  return providerInstance;
}

/**
 * Get current network configuration
 */
export function getCurrentNetwork(): NetworkConfig {
  return getNetworkConfig();
}

/**
 * Check if provider connection is healthy
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const provider = getProvider();
    const blockNumber = await provider.getBlockNumber();
    return blockNumber > 0;
  } catch (error) {
    console.error('Provider connection check failed:', error);
    return false;
  }
}

/**
 * Get current block number
 */
export async function getCurrentBlockNumber(): Promise<number> {
  try {
    const provider = getProvider();
    return await provider.getBlockNumber();
  } catch (error) {
    console.error('Failed to get block number:', error);
    throw new Error('Failed to connect to Ethereum network');
  }
}

/**
 * Get transaction by hash
 */
export async function getTransaction(txHash: string) {
  try {
    const provider = getProvider();
    return await provider.getTransaction(txHash);
  } catch (error) {
    console.error('Failed to get transaction:', error);
    return null;
  }
}

/**
 * Wait for transaction to be mined
 * 
 * @param txHash - Transaction hash
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @returns Transaction receipt
 */
export async function waitForTransaction(txHash: string, confirmations: number = 1) {
  try {
    const provider = getProvider();
    return await provider.waitForTransaction(txHash, confirmations);
  } catch (error) {
    console.error('Failed to wait for transaction:', error);
    throw new Error('Transaction confirmation failed');
  }
}

/**
 * Get Etherscan URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  const config = getNetworkConfig();
  return `${config.explorerUrl}/tx/${txHash}`;
}

/**
 * Get Etherscan URL for address
 */
export function getAddressExplorerUrl(address: string): string {
  const config = getNetworkConfig();
  return `${config.explorerUrl}/address/${address}`;
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(transaction: any): Promise<bigint> {
  try {
    const provider = getProvider();
    return await provider.estimateGas(transaction);
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw new Error('Failed to estimate gas');
  }
}

/**
 * Get current gas price
 */
export async function getGasPrice(): Promise<bigint> {
  try {
    const provider = getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  } catch (error) {
    console.error('Failed to get gas price:', error);
    throw new Error('Failed to get gas price');
  }
}

/**
 * Format Wei to Ether
 */
export function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

/**
 * Parse Ether to Wei
 */
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether);
}

/**
 * Format Wei to readable units with decimals
 */
export function formatUnits(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

/**
 * Parse amount to Wei with decimals
 */
export function parseUnits(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

