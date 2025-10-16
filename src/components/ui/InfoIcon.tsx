import React, { useState } from 'react';

interface InfoIconProps {
  tooltip: string;
  className?: string;
}

const INFO_ICON_CLASSES = {
  container: 'relative inline-flex items-center ml-1',
  icon: 'w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors duration-200',
  tooltip: 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg pointer-events-none z-50 max-w-xs min-w-max shadow-lg',
  tooltipArrow: 'absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900'
} as const;

export function InfoIcon({ tooltip, className = '' }: InfoIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${INFO_ICON_CLASSES.container} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg 
        className={INFO_ICON_CLASSES.icon}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-label="Information"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      {/* Tooltip */}
      {isHovered && (
        <div className={INFO_ICON_CLASSES.tooltip} role="tooltip">
          <div className="whitespace-normal break-words leading-relaxed text-center">
            {tooltip}
          </div>
          <div className={INFO_ICON_CLASSES.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
}

export type { InfoIconProps };
