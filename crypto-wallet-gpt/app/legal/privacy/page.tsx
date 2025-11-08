import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="secondary" size="small">← Home</Button>
        </Link>
      </div>

      <Card>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: November 7, 2024</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-700">
              Welcome to Crypto Wallet GPT ("we," "our," or "us"). We are committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency wallet service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Email address (via Google OAuth)</li>
              <li>Name and profile picture (optional, from Google)</li>
              <li>Transaction information (amounts, addresses, timestamps)</li>
              <li>Contact information you save</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage data and analytics</li>
              <li>Wallet activity logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Provide and maintain our wallet service</li>
              <li>Process cryptocurrency transactions</li>
              <li>Authenticate your identity</li>
              <li>Send you transaction confirmations and notifications</li>
              <li>Improve our service and user experience</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud or security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Triple-Layer Encryption:</strong> Private keys are encrypted at the application layer, database layer, and using Google Cloud KMS</li>
              <li><strong>Secure Authentication:</strong> OAuth 2.0 via Google</li>
              <li><strong>Rate Limiting:</strong> Protection against abuse and attacks</li>
              <li><strong>Audit Logging:</strong> All security-sensitive actions are logged</li>
              <li><strong>Secure Confirmation:</strong> Web-based transaction confirmation required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-2">We do not sell your personal information. We may share your information only in these limited circumstances:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Google Cloud, DigitalOcean)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Blockchain Networks:</strong> Transaction data is public on the blockchain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-700 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="text-gray-700 mt-2">
              To exercise these rights, please contact us at support@example.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              Email: support@example.com
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}

