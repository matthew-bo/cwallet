/**
 * Balance Checking Service
 * 
 * Fetches ETH and USDC balances from Ethereum network
 * Implements Redis caching to reduce RPC calls
 */

import { Contract } from 'ethers';
import { getProvider, formatEther, formatUnits } from './provider';
import Redis from 'ioredis';
import { getETHPriceUSD } from './pricing';

// ERC-20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// USDC contract addresses
const USDC_ADDRESSES = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
  mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'  // USDC on Mainnet
};

// Cache TTL: 5 minutes
const CACHE_TTL = 300; // seconds

/**
 * Get Redis client
 */
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not set, caching disabled');
    return null;
  }
  
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
  
  return redisClient;
}

/**
 * Get USDC contract address for current network
 */
function getUSDCAddress(): string {
  const network = process.env.ETHEREUM_NETWORK || 'sepolia';
  return USDC_ADDRESSES[network as keyof typeof USDC_ADDRESSES];
}

/**
 * Balance result interface
 */
export interface TokenBalance {
  symbol: string;
  balance: string; // Formatted balance
  balanceRaw: string; // Raw balance in smallest unit
  decimals: number;
  usdValue?: number; // USD value (optional, for display)
}

export interface WalletBalances {
  address: string;
  eth: TokenBalance;
  usdc: TokenBalance;
  totalUSD: number;
}

/**
 * Get ETH balance for an address
 */
async function getETHBalance(address: string): Promise<TokenBalance> {
  const provider = getProvider();
  const balanceWei = await provider.getBalance(address);
  
  return {
    symbol: 'ETH',
    balance: formatEther(balanceWei),
    balanceRaw: balanceWei.toString(),
    decimals: 18,
    usdValue: 0 // Will be calculated later
  };
}

/**
 * Get USDC balance for an address
 */
async function getUSDCBalance(address: string): Promise<TokenBalance> {
  const provider = getProvider();
  const usdcAddress = getUSDCAddress();
  
  const usdcContract = new Contract(usdcAddress, ERC20_ABI, provider);
  
  try {
    const [balance, decimals] = await Promise.all([
      usdcContract.balanceOf(address),
      usdcContract.decimals()
    ]);
    
    return {
      symbol: 'USDC',
      balance: formatUnits(balance, decimals),
      balanceRaw: balance.toString(),
      decimals: Number(decimals),
      usdValue: parseFloat(formatUnits(balance, decimals)) // USDC is 1:1 with USD
    };
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    // Return zero balance on error
    return {
      symbol: 'USDC',
      balance: '0',
      balanceRaw: '0',
      decimals: 6,
      usdValue: 0
    };
  }
}

/**
 * Calculate USD value for ETH
 * Uses real-time price from CoinGecko API with caching
 */
async function calculateETHUSD(ethBalance: string): Promise<number> {
  const ethPrice = await getETHPriceUSD();
  return parseFloat(ethBalance) * ethPrice;
}

/**
 * Get all balances for a wallet address
 * With Redis caching
 */
export async function getWalletBalances(address: string): Promise<WalletBalances> {
  const redis = getRedisClient();
  const cacheKey = `balance:${address}`;
  
  // Try to get from cache
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis get error:', error);
      // Continue without cache
    }
  }
  
  // Fetch balances from blockchain
  const [ethBalance, usdcBalance] = await Promise.all([
    getETHBalance(address),
    getUSDCBalance(address)
  ]);
  
  // Calculate USD values
  ethBalance.usdValue = await calculateETHUSD(ethBalance.balance);
  const totalUSD = (ethBalance.usdValue || 0) + (usdcBalance.usdValue || 0);
  
  const result: WalletBalances = {
    address,
    eth: ethBalance,
    usdc: usdcBalance,
    totalUSD
  };
  
  // Cache result
  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      console.error('Redis set error:', error);
      // Continue without caching
    }
  }
  
  return result;
}

/**
 * Invalidate balance cache for an address
 * Call after transactions to refresh balance
 */
export async function invalidateBalanceCache(address: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(`balance:${address}`);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }
}

/**
 * Get ERC-20 token balance
 * Generic function for any ERC-20 token
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<TokenBalance> {
  const provider = getProvider();
  const contract = new Contract(tokenAddress, ERC20_ABI, provider);
  
  try {
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ]);
    
    return {
      symbol,
      balance: formatUnits(balance, decimals),
      balanceRaw: balance.toString(),
      decimals: Number(decimals)
    };
  } catch (error) {
    console.error('Failed to get token balance:', error);
    throw new Error('Failed to fetch token balance');
  }
}

