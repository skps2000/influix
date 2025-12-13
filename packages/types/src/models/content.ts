import type { UUID, Timestamps } from '../common';

export interface Content extends Timestamps {
  id: UUID;
  workspaceId: UUID;
  createdBy: UUID;
  title: string;
  sourceUrl?: string;
  sourceType: ContentSourceType;
  platform: ContentPlatform;
  metadata: ContentMetadata;
  status: ContentStatus;
  lastAnalyzedAt?: string;
}

export type ContentSourceType = 'video' | 'image' | 'text' | 'audio' | 'mixed';

export type ContentPlatform = 
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'other';

export type ContentStatus = 'pending' | 'analyzing' | 'analyzed' | 'failed';

export interface ContentMetadata {
  duration?: number; // seconds
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  publishedAt?: string;
  creator?: ContentCreator;
  tags?: string[];
  transcript?: string;
  thumbnailUrl?: string;
}

export interface ContentCreator {
  name: string;
  handle?: string;
  profileUrl?: string;
  followerCount?: number;
}

export interface ContentCreateInput {
  title: string;
  sourceUrl?: string;
  sourceType: ContentSourceType;
  platform: ContentPlatform;
  metadata?: Partial<ContentMetadata>;
}

export interface ContentUpdateInput {
  title?: string;
  metadata?: Partial<ContentMetadata>;
  status?: ContentStatus;
}

export interface ContentFilters {
  platform?: ContentPlatform;
  sourceType?: ContentSourceType;
  status?: ContentStatus;
  createdBy?: UUID;
  dateFrom?: string;
  dateTo?: string;
}
