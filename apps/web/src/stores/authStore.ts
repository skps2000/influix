import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@influix/types';
import { api } from '../lib/api';

// Development mode - set to false to enable authentication
const DEV_MODE = true;

const DEV_USER: User = {
  id: 'dev-user-123',
  email: 'dev@example.com',
  name: 'Dev User',
  role: 'admin',
  avatarUrl: undefined,
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: { email: true, inApp: true, digest: 'weekly' },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
  devLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEV_MODE ? DEV_USER : null,
      tokens: DEV_MODE ? { accessToken: 'dev-token', refreshToken: 'dev-refresh-token' } : null,
      isAuthenticated: DEV_MODE ? true : false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data.data;
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, name, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { email, name, password });
          const { user, tokens } = response.data.data;
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      devLogin: () => {
        set({
          user: DEV_USER,
          tokens: { accessToken: 'dev-token', refreshToken: 'dev-refresh-token' },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });
          
          set({ tokens: response.data.data.tokens });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'influix-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
