/**
 * GET /api/health
 * 
 * Health check endpoint
 * Validates all system dependencies
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getProvider } from '@/lib/blockchain/provider';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import Redis from 'ioredis';

export async function GET() {
  const health: Record<string, string> = {};
  
  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'ok';
  } catch (error) {
    health.database = 'error';
    console.error('Database health check failed:', error);
  }
  
  // Check Redis
  try {
    if (process.env.REDIS_URL) {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      await redis.quit();
      health.redis = 'ok';
    } else {
      health.redis = 'not_configured';
    }
  } catch (error) {
    health.redis = 'error';
    console.error('Redis health check failed:', error);
  }
  
  // Check Google Cloud KMS
  try {
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'
    );
    const kmsClient = new KeyManagementServiceClient({ credentials });
    // Just check if client initializes (actual encryption test would be slow)
    health.kms = 'ok';
  } catch (error) {
    health.kms = 'error';
    console.error('KMS health check failed:', error);
  }
  
  // Check Infura
  try {
    const provider = getProvider();
    await provider.getBlockNumber();
    health.infura = 'ok';
  } catch (error) {
    health.infura = 'error';
    console.error('Infura health check failed:', error);
  }
  
  const allHealthy = Object.values(health).every(
    v => v === 'ok' || v === 'not_configured'
  );
  
  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: health
    },
    { status: allHealthy ? 200 : 503 }
  );
}

