import type { UUID, Timestamps } from '../common';

export interface User extends Timestamps {
  id: UUID;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  preferences: UserPreferences;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'member' | 'viewer';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  digest: 'daily' | 'weekly' | 'none';
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
