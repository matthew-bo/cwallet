/**
 * Authentication Helper Functions
 * 
 * Provides utilities for session validation and user authentication
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { prisma } from '../db/client';

export interface ValidationResult {
  valid: boolean;
  error: string | null;
  status: number;
  user: any | null;
}

/**
 * Validate session and ensure user still exists in database
 * 
 * @returns Validation result with user object if valid
 */
export async function validateSession(): Promise<ValidationResult> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return { 
      valid: false, 
      error: 'Unauthorized', 
      status: 401, 
      user: null 
    };
  }
  
  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  if (!user) {
    return { 
      valid: false, 
      error: 'User not found', 
      status: 404, 
      user: null 
    };
  }
  
  return { 
    valid: true, 
    error: null, 
    status: 200, 
    user 
  };
}

