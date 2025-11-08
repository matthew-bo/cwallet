/**
 * Next.js Middleware
 * 
 * Handles request logging for API routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function
 * Logs all API requests and responses
 */
export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // Log request
  console.log('[REQUEST]', {
    method: request.method,
    path: request.nextUrl.pathname,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent')?.substring(0, 100)
  });
  
  // Continue to route handler
  const response = NextResponse.next();
  
  // Log response time
  const duration = Date.now() - start;
  console.log('[RESPONSE]', {
    path: request.nextUrl.pathname,
    duration: `${duration}ms`,
    status: response.status
  });
  
  return response;
}

// Configure middleware to only run on API routes
export const config = {
  matcher: '/api/:path*'
};

