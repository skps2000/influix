import type { UUID, Timestamps } from '../common';

export interface Note extends Timestamps {
  id: UUID;
  workspaceId: UUID;
  createdBy: UUID;
  title: string;
  content: string; // Markdown content
  contentId?: UUID; // Optional link to analyzed content
  insightId?: UUID; // Optional link to AI insight
  tags: string[];
  isArchived: boolean;
}

/**
 * Notes are designed as a thinking extension, not a memo app
 * They connect user thinking to AI insights
 */
export interface NoteLink {
  id: UUID;
  noteId: UUID;
  linkedType: 'content' | 'insight' | 'note';
  linkedId: UUID;
  context?: string; // Why this link was made
}

export interface NoteCreateInput {
  title: string;
  content: string;
  contentId?: UUID;
  insightId?: UUID;
  tags?: string[];
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface NoteFilters {
  createdBy?: UUID;
  contentId?: UUID;
  insightId?: UUID;
  tags?: string[];
  isArchived?: boolean;
  search?: string;
}

export interface NoteWithLinks extends Note {
  links: NoteLink[];
  linkedContent?: {
    id: UUID;
    title: string;
  };
  linkedInsight?: {
    id: UUID;
    summary: string;
  };
}
