/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting using Redis with sliding window algorithm
 */

import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

// Rate limit configurations (requests per window in seconds)
const RATE_LIMITS = {
  authentication: { requests: 5, windowSeconds: 60 },
  balanceCheck: { requests: 30, windowSeconds: 60 },
  transactionInitiate: { requests: 10, windowSeconds: 60 },
  transactionExecute: { requests: 5, windowSeconds: 60 },
  default: { requests: 20, windowSeconds: 60 }
};

// Singleton Redis client
let redisClient: Redis | null = null;
let inMemoryStore: Map<string, { count: number; resetTime: number }> | null = null;

/**
 * Get or create Redis client singleton
 */
function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }
  
  return redisClient;
}

/**
 * Get in-memory store (fallback when Redis unavailable)
 */
function getInMemoryStore(): Map<string, { count: number; resetTime: number }> {
  if (!inMemoryStore) {
    inMemoryStore = new Map();
  }
  return inMemoryStore;
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check rate limit using sliding window algorithm
 */
async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;
  
  if (redis) {
    // Redis-based rate limiting
    try {
      const multi = redis.multi();
      
      // Remove old entries
      multi.zremrangebyscore(key, 0, windowStart);
      
      // Count requests in current window
      multi.zcard(key);
      
      // Add current request
      multi.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiry
      multi.expire(key, windowSeconds);
      
      const results = await multi.exec();
      
      if (!results) {
        throw new Error('Redis transaction failed');
      }
      
      // Get count from ZCARD result
      const count = results[1][1] as number;
      const allowed = count < limit;
      const remaining = Math.max(0, limit - count - 1);
      const reset = now + windowMs;
      
      return { allowed, remaining, reset };
      
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fall through to in-memory
    }
  }
  
  // In-memory fallback
  const store = getInMemoryStore();
  const record = store.get(key);
  
  if (!record || record.resetTime < now) {
    // New window
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: now + windowMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, reset: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, reset: record.resetTime };
}

/**
 * Rate limit middleware
 * 
 * @param request - Next.js request
 * @param type - Type of rate limit to apply
 * @param userId - Optional user ID for user-based limiting
 * @returns NextResponse if rate limited, null if allowed
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'default',
  userId?: string
): Promise<NextResponse | null> {
  try {
    const identifier = getIdentifier(request, userId);
    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;
    
    const { allowed, remaining, reset } = await checkRateLimit(
      key,
      config.requests,
      config.windowSeconds
    );
    
    if (!allowed) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }
    
    return null; // Allowed
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request (fail open)
    return null;
  }
}

/**
 * Helper to apply rate limiting in API routes
 * 
 * Usage:
 * const rateLimitResponse = await applyRateLimit(request, 'transactionInitiate', userId);
 * if (rateLimitResponse) return rateLimitResponse;
 */
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'default',
  userId?: string
): Promise<NextResponse | null> {
  return rateLimit(request, type, userId);
}


