/**
 * Navigation Component
 * Top navigation bar with user menu and sign out
 */

'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

interface NavigationProps {
  userEmail?: string | null
  userName?: string | null
  userImage?: string | null
}

export function Navigation({ userEmail, userName, userImage }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">
                🔐 Simple Wallet
              </h1>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {userEmail && (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  {userImage && (
                    <img 
                      src={userImage} 
                      alt={userName || 'User'} 
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{userName || 'User'}</p>
                    <p className="text-gray-500">{userEmail}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

