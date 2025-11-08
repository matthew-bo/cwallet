/**
 * Contact Detail API Routes
 * 
 * DELETE /api/contacts/[id] - Delete a contact
 * PATCH /api/contacts/[id] - Update a contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { deleteContact, updateContactNickname } from '@/lib/contacts/resolver';
import { applyRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';

// Schema for updating contact
const updateContactSchema = z.object({
  nickname: z.string().max(100)
});

/**
 * DELETE /api/contacts/[id]
 * Delete a contact
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Get contact ID from params
    const params = await context.params;
    const { id } = params;

    // Delete contact
    const success = await deleteContact(user.id, id);

    if (!success) {
      return NextResponse.json(
        { error: 'Contact not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contacts/[id]
 * Update a contact (nickname)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Get contact ID from params
    const params = await context.params;
    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateContactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { nickname } = validationResult.data;

    // Update contact
    const success = await updateContactNickname(user.id, id, nickname);

    if (!success) {
      return NextResponse.json(
        { error: 'Contact not found or could not be updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully'
    });

  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

