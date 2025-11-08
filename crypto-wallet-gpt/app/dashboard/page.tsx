/**
 * Dashboard Page
 * Protected page for authenticated users with wallet functionality
 */

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { Navigation } from '@/components/layout/Navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  // Server-side authentication check
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userEmail={session.user.email}
        userName={session.user.name}
        userImage={session.user.image}
      />

      <DashboardClient 
        userName={session.user.name || undefined}
      />
    </div>
  )
}

