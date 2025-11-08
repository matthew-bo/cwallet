/**
 * Cryptocurrency Price Oracle Service
 * 
 * Fetches real-time cryptocurrency prices from CoinGecko API
 * Implements caching to respect rate limits (50 calls/min)
 */

// Price cache structure
interface PriceCache {
  price: number;
  timestamp: number;
}

// In-memory cache
const priceCache = new Map<string, PriceCache>();

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_ETH_PRICE = 2000; // Fallback price if API fails
const RETRY_DELAY_MS = 1000; // 1 second retry delay
const API_TIMEOUT_MS = 5000; // 5 second timeout

// Track consecutive failures for adaptive caching
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Get ETH price in USD from cache or CoinGecko API
 * 
 * @returns Current ETH price in USD
 */
export async function getETHPriceUSD(): Promise<number> {
  try {
    // Check cache first
    const cached = priceCache.get('eth_usd');
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < getCacheDuration()) {
      return cached.price;
    }
    
    // Fetch fresh price from API
    const price = await fetchETHPrice();
    
    // Update cache
    priceCache.set('eth_usd', {
      price,
      timestamp: now
    });
    
    // Reset failure counter on success
    consecutiveFailures = 0;
    
    return price;
    
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    
    // Increment failure counter
    consecutiveFailures++;
    
    // Try to return cached price even if expired
    const cached = priceCache.get('eth_usd');
    if (cached) {
      console.warn('Using stale ETH price due to API failure');
      return cached.price;
    }
    
    // Return fallback price as last resort
    console.warn(`Using fallback ETH price: $${FALLBACK_ETH_PRICE}`);
    return FALLBACK_ETH_PRICE;
  }
}

/**
 * Get cache duration based on consecutive failures
 * Increases cache duration if API is having issues
 */
function getCacheDuration(): number {
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    // Extend cache to 15 minutes if API is down
    return 15 * 60 * 1000;
  }
  return CACHE_DURATION_MS;
}

/**
 * Fetch ETH price from CoinGecko API with retry logic
 */
async function fetchETHPrice(): Promise<number> {
  let lastError: Error | null = null;
  
  // Try twice: initial attempt + 1 retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry
        await sleep(RETRY_DELAY_MS);
        console.log(`Retrying ETH price fetch (attempt ${attempt + 1}/2)...`);
      }
      
      const price = await fetchFromCoinGecko();
      return price;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`ETH price fetch attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  
  // Both attempts failed
  throw lastError || new Error('Failed to fetch ETH price');
}

/**
 * Fetch price from CoinGecko API
 */
async function fetchFromCoinGecko(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.ethereum || typeof data.ethereum.usd !== 'number') {
      throw new Error('Invalid response structure from CoinGecko API');
    }
    
    const price = data.ethereum.usd;
    
    // Sanity check: ETH price should be reasonable
    if (price <= 0 || price > 100000) {
      throw new Error(`Unreasonable ETH price returned: $${price}`);
    }
    
    return price;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('CoinGecko API request timed out');
    }
    
    throw error;
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clear price cache (useful for testing)
 */
export function clearPriceCache(): void {
  priceCache.clear();
  consecutiveFailures = 0;
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getPricesCacheStats() {
  const cached = priceCache.get('eth_usd');
  const now = Date.now();
  
  return {
    hasCachedPrice: !!cached,
    cachedPrice: cached?.price || null,
    cacheAge: cached ? now - cached.timestamp : null,
    cacheExpired: cached ? (now - cached.timestamp) >= getCacheDuration() : null,
    consecutiveFailures,
    cacheDuration: getCacheDuration()
  };
}

