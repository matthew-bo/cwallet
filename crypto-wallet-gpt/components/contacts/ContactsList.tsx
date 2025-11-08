'use client';

/**
 * Contacts List Component
 * 
 * Displays a list of contacts with search and actions
 */

import { useState, useEffect } from 'react';
import { ContactCard } from './ContactCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface Contact {
  id: string;
  walletAddress: string;
  email?: string;
  nickname?: string;
  isVerified: boolean;
  lastUsedAt: string;
  createdAt: string;
}

interface ContactsListProps {
  limit?: number;
  onSendToContact?: (contact: Contact) => void;
}

export function ContactsList({ limit, onSendToContact }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(limit ? contacts.slice(0, limit) : contacts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(contact =>
      contact.email?.toLowerCase().includes(term) ||
      contact.nickname?.toLowerCase().includes(term) ||
      contact.walletAddress.toLowerCase().includes(term)
    );

    setFilteredContacts(limit ? filtered.slice(0, limit) : filtered);
  }, [searchTerm, contacts, limit]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/contacts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts');
      }

      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = async (contactId: string, nickname: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update contact');
      }

      // Update local state
      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, nickname } : c
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete contact');
      }

      // Update local state
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 mb-2">No contacts yet</p>
        <p className="text-sm text-gray-500">
          Send money to someone and they'll be automatically added to your contacts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {!limit && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      )}

      {/* Contacts Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        {limit && contacts.length > limit && (
          <a href="/contacts" className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </a>
        )}
      </div>

      {/* Contacts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onSend={onSendToContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />
        ))}
      </div>

      {/* Empty Search Results */}
      {searchTerm && filteredContacts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No contacts found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

