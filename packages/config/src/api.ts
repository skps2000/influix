/**
 * API route configuration
 * Centralized route definitions for type-safe API calls
 */

export const API_VERSION = 'v1';

export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PREFERENCES: (id: string) => `/users/${id}/preferences`,
  },

  // Workspaces
  WORKSPACES: {
    BASE: '/workspaces',
    BY_ID: (id: string) => `/workspaces/${id}`,
    MEMBERS: (id: string) => `/workspaces/${id}/members`,
    INVITE: (id: string) => `/workspaces/${id}/invite`,
  },

  // Content
  CONTENT: {
    BASE: '/content',
    BY_ID: (id: string) => `/content/${id}`,
    ANALYZE: (id: string) => `/content/${id}/analyze`,
    INSIGHTS: (id: string) => `/content/${id}/insights`,
  },

  // Insights
  INSIGHTS: {
    BASE: '/insights',
    BY_ID: (id: string) => `/insights/${id}`,
    REGENERATE: (id: string) => `/insights/${id}/regenerate`,
  },

  // Notes
  NOTES: {
    BASE: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
    LINKS: (id: string) => `/notes/${id}/links`,
  },

  // AI Prompts
  PROMPTS: {
    BASE: '/prompts',
    BY_ID: (id: string) => `/prompts/${id}`,
    VERSIONS: (id: string) => `/prompts/${id}/versions`,
    TEST: (id: string) => `/prompts/${id}/test`,
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/dashboard',
    INSIGHTS: '/dashboard/insights',
    STATS: '/dashboard/stats',
  },
} as const;

/**
 * Build full API URL
 */
export function buildApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}/api/${API_VERSION}${route}`;
}
