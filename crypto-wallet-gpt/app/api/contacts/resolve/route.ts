/**
 * Contact Resolve API Route
 * 
 * POST /api/contacts/resolve - Resolve email or address to wallet info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { resolveRecipient } from '@/lib/contacts/resolver';
import { applyRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';

// Schema for resolving recipient
const resolveSchema = z.object({
  recipient: z.string().min(1)
});

/**
 * POST /api/contacts/resolve
 * Resolve an email or address to wallet information
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const { prisma } = await import('@/lib/db/client');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = resolveSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { recipient } = validationResult.data;

    // Resolve recipient
    const resolved = await resolveRecipient(recipient, user.id);

    return NextResponse.json({
      success: true,
      ...resolved
    });

  } catch (error) {
    console.error('Failed to resolve recipient:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to resolve recipient',
        success: false
      },
      { status: 400 }
    );
  }
}

