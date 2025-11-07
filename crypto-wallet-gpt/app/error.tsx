/**
 * Global Error Boundary
 * Catches and displays errors that occur anywhere in the app
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  )
}

