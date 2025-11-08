import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="secondary" size="small">← Home</Button>
        </Link>
      </div>

      <Card>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: November 7, 2024</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using Crypto Wallet GPT, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
            <p className="text-gray-700">
              Crypto Wallet GPT is a custodial cryptocurrency wallet service that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Store and manage USDC (stablecoin)</li>
              <li>Send and receive cryptocurrency</li>
              <li>View transaction history</li>
              <li>Manage contacts for easy sending</li>
            </ul>
            <p className="text-gray-700 mt-2">
              <strong>Important:</strong> This is a custodial wallet service. We manage and secure your private keys on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-2">By using our service, you agree to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Verify all transaction details before confirming</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the service for illegal activities</li>
              <li>Not attempt to hack, disrupt, or abuse the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Account Security</h2>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your Google account credentials. 
              You must notify us immediately of any unauthorized access to your account. We are not liable for losses 
              resulting from unauthorized account access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Transactions</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1 Transaction Confirmation</h3>
            <p className="text-gray-700">
              All transactions require explicit confirmation on our secure confirmation page. Once confirmed and submitted to the blockchain, 
              transactions <strong>cannot be reversed or cancelled</strong>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">5.2 Network Fees</h3>
            <p className="text-gray-700">
              Blockchain transactions require network fees (gas fees). These fees are paid to the blockchain network, not to us, 
              and are not refundable regardless of transaction outcome.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">5.3 Transaction Limits</h3>
            <p className="text-gray-700">
              We may impose transaction limits based on your account verification level. These limits are for security and compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Fees</h2>
            <p className="text-gray-700">
              Currently, we do not charge service fees beyond blockchain network fees. We reserve the right to introduce fees in the future 
              with prior notice to users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Prohibited Activities</h2>
            <p className="text-gray-700 mb-2">You may not use our service to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Engage in illegal activities or money laundering</li>
              <li>Finance terrorism or other criminal activities</li>
              <li>Violate sanctions or export control laws</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Manipulate or exploit our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
            <p className="text-gray-700">
              We strive to provide 99.9% uptime but cannot guarantee uninterrupted service. We may suspend or terminate service 
              for maintenance, security reasons, or force majeure events without liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-700">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-700 mt-2">
              Our total liability shall not exceed the amount of fees paid to us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-gray-700">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless Crypto Wallet GPT and its affiliates from any claims, damages, losses, 
              liabilities, and expenses arising from your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Account Termination</h2>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate your account at our discretion, with or without notice, for violations 
              of these terms or suspicious activity. Upon termination, you must withdraw your funds within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Dispute Resolution</h2>
            <p className="text-gray-700">
              Any disputes arising from these terms shall be resolved through binding arbitration. You waive your right to participate 
              in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by the laws of the United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. 
              We will notify users of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">16. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, contact us at:
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

