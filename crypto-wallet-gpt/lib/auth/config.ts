/**
 * NextAuth Configuration and Helper Functions
 * Provides authentication utilities for server and client components
 */

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db/client'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session for easy access
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Store Gmail ID for easy lookup
      if (account?.provider === 'google' && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            gmailId: account.providerAccountId,
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email,
            gmailId: account.providerAccountId,
            name: user.name,
            image: user.image,
            kycTier: 0, // Start with email-only verification
          }
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/', // Redirect to landing page for sign-in
    error: '/', // Redirect errors to landing page
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

