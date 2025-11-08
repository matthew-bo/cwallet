import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="secondary" size="small">← Home</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Crypto Wallet GPT</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">What is Crypto Wallet GPT?</h2>
            <p className="text-gray-700">
              Crypto Wallet GPT is a simple, secure cryptocurrency wallet designed to make sending and receiving digital money as easy as possible. 
              Built for ChatGPT users, it provides a seamless way to manage your USDC (a stablecoin worth $1) directly through conversational commands.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📤 Easy Sending</h3>
                <p className="text-sm text-gray-700">
                  Send money using email addresses or wallet addresses. We automatically resolve contacts for you.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📥 Quick Receiving</h3>
                <p className="text-sm text-gray-700">
                  Share your wallet address or QR code to receive money instantly from anyone.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">👥 Contact Management</h3>
                <p className="text-sm text-gray-700">
                  Save frequently used contacts for quick and easy repeat transactions.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Secure & Safe</h3>
                <p className="text-sm text-gray-700">
                  Triple-layer encryption and secure confirmation for every transaction.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">How It Works</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Sign In with Google:</strong> Quick and secure authentication using your Google account.
              </li>
              <li>
                <strong>Automatic Wallet Creation:</strong> We create and secure your wallet instantly.
              </li>
              <li>
                <strong>Send & Receive:</strong> Use email addresses or wallet addresses to transact.
              </li>
              <li>
                <strong>Secure Confirmation:</strong> Every transaction requires explicit confirmation for security.
              </li>
              <li>
                <strong>Track History:</strong> View all your transactions in one place.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Security First</h2>
            <p className="text-gray-700 mb-3">
              Your security is our top priority. We implement multiple layers of protection:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Triple-Layer Encryption:</strong> Your private keys are encrypted at the application, database, and cloud levels</li>
              <li><strong>Custodial Service:</strong> We manage keys securely so you don't have to worry about seed phrases</li>
              <li><strong>Secure Confirmation:</strong> Web-based confirmation required for all transactions</li>
              <li><strong>Rate Limiting:</strong> Protection against automated attacks</li>
              <li><strong>Audit Logging:</strong> Complete audit trail of all security-sensitive actions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Perfect For</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">👋</div>
                <h3 className="font-semibold text-gray-900 mb-1">Crypto Beginners</h3>
                <p className="text-sm text-gray-600">
                  No technical knowledge required. We handle the complexity.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">👨‍💼</div>
                <h3 className="font-semibold text-gray-900 mb-1">Everyday Users</h3>
                <p className="text-sm text-gray-600">
                  Send money to friends and family quickly and easily.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-1">ChatGPT Enthusiasts</h3>
                <p className="text-sm text-gray-600">
                  Manage your wallet through natural conversation.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Current Limitations</h2>
            <p className="text-gray-700 mb-2">
              As an MVP, we currently support:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>USDC only (Ethereum network)</li>
              <li>Sepolia testnet (testing environment)</li>
              <li>Basic send/receive functionality</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>Coming Soon:</strong> Bitcoin support, multi-chain capabilities, fiat on-ramp, staking, and more!
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Get Started</h2>
            <p className="text-gray-700 mb-4">
              Ready to start using Crypto Wallet GPT? Sign in with Google to create your wallet in seconds!
            </p>
            <Link href="/dashboard">
              <Button variant="primary" className="inline-block">
                Get Started →
              </Button>
            </Link>
          </section>

          <section className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Need Help?</h2>
            <p className="text-gray-700 mb-3">
              Check out our <Link href="/help" className="text-blue-600 hover:underline">Help Center</Link> for FAQs and guides, 
              or contact us at support@example.com.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}

