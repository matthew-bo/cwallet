/**
 * Dashboard Page
 * Protected page for authenticated users
 */

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{session.user.name ? `, ${session.user.name}` : ''}! 👋
          </h1>
          <p className="text-gray-600">
            Your crypto wallet is ready. Phase 2 will add wallet functionality.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm">{session.user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">KYC Tier</p>
                <p className="font-medium">Tier 0 (Email Verified)</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Phase 1 Status</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Authentication configured</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Database setup complete</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Google Cloud KMS integrated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-gray-500">Wallet generation (Phase 2)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-gray-500">Transactions (Phase 2)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Placeholder Cards for Future Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center opacity-60">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold mb-2">Balance</h3>
            <p className="text-sm text-gray-500">Coming in Phase 2</p>
          </Card>

          <Card className="text-center opacity-60">
            <div className="text-4xl mb-3">📤</div>
            <h3 className="font-semibold mb-2">Send Crypto</h3>
            <p className="text-sm text-gray-500">Coming in Phase 2</p>
          </Card>

          <Card className="text-center opacity-60">
            <div className="text-4xl mb-3">📥</div>
            <h3 className="font-semibold mb-2">Receive Crypto</h3>
            <p className="text-sm text-gray-500">Coming in Phase 2</p>
          </Card>
        </div>

        {/* Development Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Phase 1 Complete!</h3>
              <p className="text-blue-800 text-sm">
                Foundation is ready: Next.js app, database with Prisma, Google OAuth authentication,
                and KMS encryption. Wallet functionality will be added in Phase 2.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

