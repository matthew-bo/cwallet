/**
 * CSRF Protection
 * 
 * Validates that requests come from the same origin
 */

import { NextRequest } from 'next/server';

/**
 * Validate CSRF by checking Origin/Referer headers
 * 
 * @param request - Next.js request object
 * @returns true if request is from same origin, false otherwise
 */
export function validateCSRF(request: NextRequest): boolean {
  // For API routes called from same-origin, check Origin/Referer headers
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  // Allow requests from same origin
  if (origin && host && origin.includes(host)) {
    return true;
  }
  
  if (referer && host && referer.includes(host)) {
    return true;
  }
  
  // In development, be lenient
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // For production, strict validation
  return false;
}

