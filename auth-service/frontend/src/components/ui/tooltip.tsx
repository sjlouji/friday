import React, { ReactNode } from 'react';
import './tooltip.css';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  return (
    <div className={`tooltip tooltip-${position}`}>
      <div className="tooltip-trigger">
        {children}
      </div>
      <div className="tooltip-content">
        {content}
      </div>
    </div>
  );
} 