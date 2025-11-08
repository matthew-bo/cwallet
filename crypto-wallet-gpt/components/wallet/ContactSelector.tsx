'use client';

/**
 * Contact Selector Component
 * 
 * Provides autocomplete/suggestions for contacts when entering recipient
 */

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  walletAddress: string;
  email?: string;
  nickname?: string;
  isVerified: boolean;
  lastUsedAt: string;
}

interface ContactSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectContact?: (contact: Contact) => void;
  disabled?: boolean;
}

export function ContactSelector({ value, onChange, onSelectContact, disabled }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts based on input
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredContacts([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.email?.toLowerCase().includes(searchTerm) ||
      contact.nickname?.toLowerCase().includes(searchTerm) ||
      contact.walletAddress.toLowerCase().includes(searchTerm)
    );

    setFilteredContacts(filtered);
    setShowSuggestions(filtered.length > 0 && value.length >= 2);
  }, [value, contacts]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    // Use email if available, otherwise use wallet address
    const displayValue = contact.email || contact.walletAddress;
    onChange(displayValue);
    setShowSuggestions(false);
    
    if (onSelectContact) {
      onSelectContact(contact);
    }
  };

  const getDisplayName = (contact: Contact) => {
    if (contact.nickname) {
      return contact.nickname;
    }
    if (contact.email) {
      return contact.email;
    }
    return `${contact.walletAddress.substring(0, 10)}...${contact.walletAddress.substring(contact.walletAddress.length - 8)}`;
  };

  const getSubtext = (contact: Contact) => {
    if (contact.nickname && contact.email) {
      return contact.email;
    }
    if (contact.email) {
      return contact.walletAddress.substring(0, 10) + '...' + contact.walletAddress.substring(contact.walletAddress.length - 8);
    }
    return '';
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && filteredContacts.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Email or Ethereum address (0x...)"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && filteredContacts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelectContact(contact)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {getDisplayName(contact)}
                    {contact.isVerified && (
                      <span className="text-green-600 text-xs">✓ Verified</span>
                    )}
                  </div>
                  {getSubtext(contact) && (
                    <div className="text-sm text-gray-500 mt-0.5">
                      {getSubtext(contact)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(contact.lastUsedAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent Contacts Hint */}
      {!value && contacts.length > 0 && !loading && (
        <p className="text-xs text-gray-500 mt-1">
          💡 Start typing to see your {contacts.length} saved contact{contacts.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <p className="text-xs text-gray-500 mt-1">
          Loading contacts...
        </p>
      )}
    </div>
  );
}

