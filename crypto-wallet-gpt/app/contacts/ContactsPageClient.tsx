'use client';

/**
 * Contacts Page Client Component
 * 
 * Full contacts management page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ContactsList } from '@/components/contacts/ContactsList';
import { AddContactModal } from '@/components/contacts/AddContactModal';

interface ContactsPageClientProps {
  userName?: string;
}

export function ContactsPageClient({ userName }: ContactsPageClientProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSendToContact = (contact: any) => {
    // Navigate to dashboard and pre-fill send form
    // For now, just navigate to dashboard
    router.push('/dashboard');
  };

  const handleContactAdded = () => {
    // Refresh the contacts list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Contacts
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
            >
              ➕ Add Contact
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="secondary"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Manage your saved contacts for easy sending
        </p>
      </div>

      {/* Contacts List */}
      <Card>
        <ContactsList 
          key={refreshKey}
          onSendToContact={handleSendToContact}
        />
      </Card>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
}

