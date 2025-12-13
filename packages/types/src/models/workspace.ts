import type { UUID, Timestamps } from '../common';

export interface Workspace extends Timestamps {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  ownerId: UUID;
  settings: WorkspaceSettings;
  memberCount: number;
}

export interface WorkspaceSettings {
  defaultContentVisibility: 'private' | 'workspace' | 'public';
  aiAnalysisEnabled: boolean;
  retentionDays: number;
}

export interface WorkspaceMember extends Timestamps {
  id: UUID;
  workspaceId: UUID;
  userId: UUID;
  role: WorkspaceMemberRole;
  invitedBy?: UUID;
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface WorkspaceCreateInput {
  name: string;
  slug: string;
  description?: string;
}

export interface WorkspaceUpdateInput {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface WorkspaceInvite {
  id: UUID;
  workspaceId: UUID;
  email: string;
  role: WorkspaceMemberRole;
  expiresAt: string;
  invitedBy: UUID;
}
