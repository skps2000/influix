import React from 'react';
import { cn } from '../utils/cn';

/**
 * Typography components with established hierarchy
 * Design principle: typographic hierarchy for calm, intelligent UI
 */

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div';
  size?: 'xs' | 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold';
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  muted = false,
  className,
  children,
  ...props
}) => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
  };

  return (
    <Component
      className={cn(
        sizes[size],
        weights[weight],
        muted ? 'text-surface-400' : 'text-surface-100',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Heading: React.FC<HeadingProps> = ({
  as: Component = 'h2',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const sizes = {
    xs: 'text-sm font-semibold',
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
    '2xl': 'text-3xl font-bold tracking-tight',
  };

  return (
    <Component
      className={cn('text-surface-50', sizes[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <label
      className={cn('text-sm font-medium text-surface-200', className)}
      {...props}
    >
      {children}
    </label>
  );
};
