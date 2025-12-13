import prisma from '../lib/prisma';
import type { Workspace, WorkspaceCreateInput } from '@influix/types';

/**
 * Workspace Service - Business logic for workspace management
 * Connected to Supabase PostgreSQL via Prisma
 */

export const workspaceService = {
  async create(input: WorkspaceCreateInput & { ownerId: string }): Promise<Workspace> {
    const workspace = await prisma.workspace.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        ownerId: input.ownerId,
        settings: {
          defaultContentVisibility: 'private',
          aiAnalysisEnabled: true,
          retentionDays: 365,
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // Add owner as a member with OWNER role
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: input.ownerId,
        role: 'OWNER',
      },
    });

    return mapPrismaWorkspaceToWorkspace(workspace);
  },

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!workspace) return null;
    return mapPrismaWorkspaceToWorkspace(workspace);
  },

  async findBySlug(slug: string): Promise<Workspace | null> {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!workspace) return null;
    return mapPrismaWorkspaceToWorkspace(workspace);
  },

  async listByUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...mapPrismaWorkspaceToWorkspace(m.workspace),
      role: m.role.toLowerCase(),
    }));
  },

  async getOrCreateDefaultWorkspace(userId: string): Promise<Workspace> {
    // Check if user has any workspace
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      take: 1,
    });

    if (memberships.length > 0) {
      const ws = memberships[0].workspace;
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        description: ws.description || undefined,
        ownerId: ws.ownerId,
        settings: ws.settings as any,
        memberCount: 1,
        createdAt: ws.createdAt.toISOString(),
        updatedAt: ws.updatedAt.toISOString(),
      };
    }

    // Create default workspace
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const slug = `workspace-${userId.slice(0, 8)}`;
    
    return this.create({
      name: `${user?.name || 'My'}'s Workspace`,
      slug,
      ownerId: userId,
    });
  },

  async update(id: string, input: Partial<WorkspaceCreateInput>): Promise<Workspace | null> {
    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return mapPrismaWorkspaceToWorkspace(workspace);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.workspace.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
    return !!member;
  },
};

// Helper function
function mapPrismaWorkspaceToWorkspace(workspace: any): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description || undefined,
    ownerId: workspace.ownerId,
    settings: workspace.settings as any,
    memberCount: workspace._count?.members || 0,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  };
}
