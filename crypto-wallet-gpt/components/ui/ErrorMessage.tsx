/**
 * ErrorMessage Component
 * Display error messages with consistent styling
 */

import React from 'react'

interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <svg 
          className="h-5 w-5 text-red-500" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}

