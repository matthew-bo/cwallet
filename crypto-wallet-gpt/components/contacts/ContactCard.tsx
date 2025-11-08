'use client';

/**
 * Contact Card Component
 * 
 * Displays a single contact with quick actions
 */

import { useState } from 'react';
import { Button } from '../ui/Button';

interface ContactCardProps {
  contact: {
    id: string;
    walletAddress: string;
    email?: string;
    nickname?: string;
    isVerified: boolean;
    lastUsedAt: string;
  };
  onSend?: (contact: any) => void;
  onEdit?: (contactId: string, nickname: string) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactCard({ contact, onSend, onEdit, onDelete }: ContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(contact.nickname || '');

  const getInitials = () => {
    if (contact.nickname) {
      return contact.nickname
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (contact.email) {
      return contact.email.slice(0, 2).toUpperCase();
    }
    return contact.walletAddress.slice(2, 4).toUpperCase();
  };

  const getDisplayName = () => {
    if (contact.nickname) return contact.nickname;
    if (contact.email) return contact.email;
    return `${contact.walletAddress.substring(0, 10)}...${contact.walletAddress.substring(contact.walletAddress.length - 8)}`;
  };

  const getSubtext = () => {
    if (contact.nickname && contact.email) return contact.email;
    if (contact.email) {
      return `${contact.walletAddress.substring(0, 10)}...${contact.walletAddress.substring(contact.walletAddress.length - 8)}`;
    }
    return '';
  };

  const handleSaveEdit = () => {
    if (onEdit && editedNickname.trim()) {
      onEdit(contact.id, editedNickname.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedNickname(contact.nickname || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
          {getInitials()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-2">
              <input
                type="text"
                value={editedNickname}
                onChange={(e) => setEditedNickname(e.target.value)}
                placeholder="Enter nickname"
                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {getDisplayName()}
                </h3>
                {contact.isVerified && (
                  <span className="text-green-600 text-xs flex items-center">
                    ✓ Verified
                  </span>
                )}
              </div>

              {getSubtext() && (
                <p className="text-sm text-gray-500 truncate">{getSubtext()}</p>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Last used: {new Date(contact.lastUsedAt).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onSend?.(contact)}
            variant="primary"
            size="small"
            className="flex-1"
          >
            📤 Send
          </Button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete contact ${getDisplayName()}?`)) {
                onDelete?.(contact.id);
              }
            }}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

