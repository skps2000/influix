/**
 * Application-wide constants
 * No magic strings - all constants defined here
 */

export const APP_NAME = 'InfluiX';
export const APP_DESCRIPTION = 'AI-native influence intelligence platform';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Authentication
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
} as const;

// AI Configuration
export const AI = {
  DEFAULT_MODEL: 'gpt-4-turbo-preview',
  DEFAULT_TEMPERATURE: 0.3, // Low for deterministic outputs
  MAX_TOKENS: 4096,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// Content analysis
export const CONTENT = {
  MAX_TITLE_LENGTH: 500,
  MAX_TRANSCRIPT_LENGTH: 50000,
  SUPPORTED_PLATFORMS: [
    'youtube',
    'tiktok',
    'instagram',
    'twitter',
    'linkedin',
    'other',
  ] as const,
  ANALYSIS_TIMEOUT_MS: 60000,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  AI_REQUESTS_PER_HOUR: 100,
  AUTH_ATTEMPTS_PER_HOUR: 10,
} as const;

// UI Theme (dark-mode first)
export const THEME = {
  DEFAULT: 'dark',
  COLORS: {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Violet
    accent: '#22d3ee', // Cyan
    background: '#0f0f0f',
    surface: '#1a1a1a',
    surfaceHover: '#262626',
    text: '#fafafa',
    textMuted: '#a3a3a3',
    border: '#262626',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
  },
} as const;
