/**
 * Contact Resolver
 * 
 * Resolves email addresses to wallet addresses
 * Manages contact lookups and validations
 */

import { prisma } from '@/lib/db/client';
import { isAddress } from 'ethers';

/**
 * Check if a string is a valid Ethereum address
 */
export function isEthereumAddress(input: string): boolean {
  return isAddress(input);
}

/**
 * Check if a string looks like an email address
 */
export function isEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Resolve a recipient input (email or address) to an Ethereum address
 * 
 * @param input - Email address or Ethereum address
 * @param userId - ID of the user making the request (to check contacts)
 * @returns Resolved Ethereum address and contact info
 */
export async function resolveRecipient(
  input: string,
  userId: string
): Promise<{
  address: string;
  email?: string;
  nickname?: string;
  isNewRecipient: boolean;
  isVerifiedUser: boolean;
}> {
  const trimmedInput = input.trim();

  // Case 1: Input is already an Ethereum address
  if (isEthereumAddress(trimmedInput)) {
    // Check if this address is in user's contacts
    const contact = await prisma.contact.findUnique({
      where: {
        userId_walletAddress: {
          userId,
          walletAddress: trimmedInput.toLowerCase()
        }
      }
    });

    return {
      address: trimmedInput.toLowerCase(),
      email: contact?.email || undefined,
      nickname: contact?.nickname || undefined,
      isNewRecipient: !contact,
      isVerifiedUser: contact?.isVerified || false
    };
  }

  // Case 2: Input looks like an email
  if (isEmail(trimmedInput)) {
    // First, check if it's in user's contacts
    const contact = await prisma.contact.findUnique({
      where: {
        userId_email: {
          userId,
          email: trimmedInput.toLowerCase()
        }
      }
    });

    if (contact) {
      return {
        address: contact.walletAddress,
        email: contact.email || undefined,
        nickname: contact.nickname || undefined,
        isNewRecipient: false,
        isVerifiedUser: contact.isVerified
      };
    }

    // If not in contacts, lookup in our user database
    const user = await prisma.user.findUnique({
      where: { email: trimmedInput.toLowerCase() },
      include: { wallets: true }
    });

    if (user?.wallets[0]) {
      return {
        address: user.wallets[0].address.toLowerCase(),
        email: user.email,
        nickname: user.name || undefined,
        isNewRecipient: true,
        isVerifiedUser: true
      };
    }

    // Email not found in our system
    throw new Error(
      `Email address "${trimmedInput}" not found. The recipient needs to create a wallet first. Invite them to join!`
    );
  }

  // Case 3: Input is neither a valid address nor email
  throw new Error(
    'Please enter a valid Ethereum address (starting with 0x) or email address'
  );
}

/**
 * Save or update a contact for a user
 */
export async function saveContact(
  userId: string,
  walletAddress: string,
  email?: string,
  nickname?: string,
  isVerified: boolean = false
): Promise<void> {
  const data = {
    userId,
    walletAddress: walletAddress.toLowerCase(),
    email: email?.toLowerCase(),
    nickname,
    isVerified,
    lastUsedAt: new Date()
  };

  // Try to update existing contact, or create new one
  await prisma.contact.upsert({
    where: {
      userId_walletAddress: {
        userId,
        walletAddress: walletAddress.toLowerCase()
      }
    },
    update: {
      lastUsedAt: new Date(),
      nickname: nickname || undefined,
      email: email?.toLowerCase() || undefined,
      isVerified
    },
    create: data
  });
}

/**
 * Get all contacts for a user
 */
export async function getUserContacts(userId: string, limit: number = 50) {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { lastUsedAt: 'desc' },
    take: limit
  });
}

/**
 * Get recent contacts (last 5)
 */
export async function getRecentContacts(userId: string) {
  return getUserContacts(userId, 5);
}

/**
 * Delete a contact
 */
export async function deleteContact(userId: string, contactId: string): Promise<boolean> {
  try {
    await prisma.contact.delete({
      where: {
        id: contactId,
        userId // Ensure user owns this contact
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update contact nickname
 */
export async function updateContactNickname(
  userId: string,
  contactId: string,
  nickname: string
): Promise<boolean> {
  try {
    await prisma.contact.update({
      where: {
        id: contactId,
        userId
      },
      data: { nickname }
    });
    return true;
  } catch (error) {
    return false;
  }
}

