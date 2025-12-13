import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-800 text-surface-300',
    success: 'bg-green-900/50 text-green-400 border-green-800',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-800',
    error: 'bg-red-900/50 text-red-400 border-red-800',
    info: 'bg-blue-900/50 text-blue-400 border-blue-800',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border border-transparent',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
