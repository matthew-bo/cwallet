/**
 * Card Component
 * Container component for content sections with consistent styling
 */

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export function Card({ children, className = '', padding = 'medium' }: CardProps) {
  const paddingStyles = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  )
}

