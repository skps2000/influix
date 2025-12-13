/**
 * Environment configuration
 * Type-safe environment variable access
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvConfig {
  NODE_ENV: Environment;
  API_URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  PORT: number;
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: keyof EnvConfig, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get numeric environment variable
 */
export function getEnvNumber(key: keyof EnvConfig, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${key}=${value}`);
  }
  return parsed;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}
