import prisma from '../lib/prisma';
import type { User, UserCreateInput, UserUpdateInput, UserPreferences } from '@influix/types';

/**
 * User Service - Business logic for user management
 * Connected to Supabase PostgreSQL via Prisma
 */

export const userService = {
  async create(input: UserCreateInput & { password: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.password, // Already hashed by route
        role: 'MEMBER',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            inApp: true,
            digest: 'weekly',
          },
        },
      },
    });

    return mapPrismaUserToUser(user);
  },

  async findById(id: string): Promise<(User & { passwordHash: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return mapPrismaUserToUserWithPassword(user);
  },

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return mapPrismaUserToUserWithPassword(user);
  },

  async update(id: string, input: UserUpdateInput): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        avatarUrl: input.avatarUrl,
      },
    });

    return mapPrismaUserToUser(user);
  },

  async updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<User | null> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) return null;

    const currentPrefs = (existingUser.preferences as any) as UserPreferences;
    const updatedPrefs = { ...currentPrefs, ...preferences };

    const user = await prisma.user.update({
      where: { id },
      data: {
        preferences: updatedPrefs as any,
      },
    });

    return mapPrismaUserToUser(user);
  },

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Refresh token management
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  },

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },
};

// Helper functions to map Prisma types to our types
function mapPrismaUserToUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl || undefined,
    role: user.role.toLowerCase() as 'admin' | 'member' | 'viewer',
    preferences: user.preferences as UserPreferences,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function mapPrismaUserToUserWithPassword(user: any): User & { passwordHash: string } {
  return {
    ...mapPrismaUserToUser(user),
    passwordHash: user.passwordHash,
  };
}
