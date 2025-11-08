'use client';

/**
 * Help Tooltip Component
 * 
 * Shows contextual help information on hover or click
 */

import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, position = 'top' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-full hover:border-gray-400 transition-colors"
        aria-label="Help"
      >
        ?
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg">
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

