/**
 * Contacts API Routes
 * 
 * GET /api/contacts - List all contacts
 * POST /api/contacts - Add/update a contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getUserContacts, saveContact } from '@/lib/contacts/resolver';
import { applyRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';

// Schema for adding a contact
const addContactSchema = z.object({
  walletAddress: z.string().min(42).max(42).startsWith('0x'),
  email: z.string().email().optional(),
  nickname: z.string().max(100).optional()
});

/**
 * GET /api/contacts
 * List all contacts for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get contacts
    const contacts = await getUserContacts(user.id);

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact.id,
        walletAddress: contact.walletAddress,
        email: contact.email,
        nickname: contact.nickname,
        isVerified: contact.isVerified,
        lastUsedAt: contact.lastUsedAt,
        createdAt: contact.createdAt
      }))
    });

  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Add or update a contact
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
    const validationResult = addContactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { walletAddress, email, nickname } = validationResult.data;

    // Save contact
    await saveContact(user.id, walletAddress, email, nickname);

    return NextResponse.json({
      success: true,
      message: 'Contact saved successfully'
    });

  } catch (error) {
    console.error('Failed to save contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save contact' },
      { status: 500 }
    );
  }
}

