'use client';

/**
 * Help Page Client Component
 * 
 * FAQ and help documentation
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface HelpPageClientProps {
  isAuthenticated: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function HelpPageClient({ isAuthenticated }: HelpPageClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'basics',
      question: 'What is USDC?',
      answer: 'USDC is a stablecoin - a type of cryptocurrency that is pegged to the US Dollar. 1 USDC = $1 USD. It combines the speed and security of blockchain with the stability of traditional currency.'
    },
    {
      category: 'basics',
      question: 'What is a wallet address?',
      answer: 'A wallet address is like your bank account number for cryptocurrency. It\'s a unique string of letters and numbers (starting with 0x) that people use to send you money. You can share your wallet address publicly - it\'s safe!'
    },
    {
      category: 'sending',
      question: 'How do I send money to someone?',
      answer: 'Go to your dashboard, enter the recipient\'s email or wallet address, enter the amount, and click Send. You\'ll be taken to a secure confirmation page where you must verify and confirm the transaction.'
    },
    {
      category: 'sending',
      question: 'Can I send to someone\'s email?',
      answer: 'Yes! If the recipient has a wallet with our service, you can send directly to their email address. The system will automatically resolve it to their wallet address.'
    },
    {
      category: 'receiving',
      question: 'How do I receive money?',
      answer: 'Simply share your wallet address with the sender. You can find it on your dashboard, or show them your QR code. When they send money to your address, it will appear in your wallet automatically.'
    },
    {
      category: 'receiving',
      question: 'How long does it take to receive money?',
      answer: 'Transactions on the blockchain typically take 10-30 seconds to be confirmed. You\'ll see it as "pending" in your transaction history, then it will update to "confirmed" once finalized.'
    },
    {
      category: 'security',
      question: 'Is this wallet secure?',
      answer: 'Yes! We use triple-layer encryption (application, database, and Google Cloud KMS) to protect your private keys. We also use secure confirmation pages for all transactions to prevent unauthorized sends.'
    },
    {
      category: 'security',
      question: 'What is a custodial wallet?',
      answer: 'A custodial wallet means we securely store and manage your private keys for you. This makes it easier to use (no seed phrases to remember!), but it means you trust us to keep your funds safe - which we take very seriously.'
    },
    {
      category: 'fees',
      question: 'What are network fees?',
      answer: 'Network fees (also called "gas fees") are small fees required to process transactions on the blockchain. They pay for the computing power needed to validate and record your transaction. These fees go to the network, not to us.'
    },
    {
      category: 'fees',
      question: 'How much are the fees?',
      answer: 'Network fees vary based on blockchain congestion. For USDC transfers on Sepolia testnet, fees are typically $1-3. We show you the estimated fee before you confirm any transaction.'
    },
    {
      category: 'testnet',
      question: 'What is Sepolia testnet?',
      answer: 'Sepolia is a test version of the Ethereum blockchain. It uses fake money for testing purposes. This means all transactions on this wallet are for demonstration only - they don\'t involve real money.'
    },
    {
      category: 'testnet',
      question: 'How do I get testnet tokens?',
      answer: 'You can get free Sepolia ETH (for gas fees) from faucets like https://sepoliafaucet.com/. For testnet USDC, you may need to use specific testnet faucets or request from the project team.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'basics', name: 'Basics' },
    { id: 'sending', name: 'Sending Money' },
    { id: 'receiving', name: 'Receiving Money' },
    { id: 'security', name: 'Security' },
    { id: 'fees', name: 'Fees' },
    { id: 'testnet', name: 'Testnet' }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          {isAuthenticated && (
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              ← Back to Dashboard
            </Button>
          )}
        </div>
        <p className="text-gray-600">
          Find answers to common questions about your crypto wallet
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex items-center justify-between group"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors pr-4">
                  {faq.question}
                </h3>
                <span className="text-2xl text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                  {expandedId === index ? '−' : '+'}
                </span>
              </button>
              {expandedId === index && (
                <div className="mt-3 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Resources */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center p-2">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Can't find what you're looking for? Contact our support team.
            </p>
            <a
              href="mailto:support@example.com"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="text-center p-2">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-semibold text-gray-900 mb-2">New to Crypto?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Learn the basics of cryptocurrency and blockchain.
            </p>
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Learn More →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

