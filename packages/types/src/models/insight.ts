import type { UUID, Timestamps } from '../common';

export interface Insight extends Timestamps {
  id: UUID;
  contentId: UUID;
  workspaceId: UUID;
  promptId: UUID;
  promptVersion: number;
  analysis: InsightAnalysis;
  confidence: number; // 0-1
  status: InsightStatus;
}

export type InsightStatus = 'generating' | 'complete' | 'failed' | 'stale';

/**
 * Structured AI analysis output
 * This schema is enforced in AI prompts for deterministic outputs
 */
export interface InsightAnalysis {
  summary: string;
  whyItWorks: string[];
  patterns: InsightPattern[];
  reuseStrategy: string;
  hookAnalysis?: HookAnalysis;
  toneAnalysis?: ToneAnalysis;
  narrativeStructure?: NarrativeStructure;
  engagementLogic?: EngagementLogic;
}

export interface InsightPattern {
  name: string;
  description: string;
  examples?: string[];
  applicability: 'high' | 'medium' | 'low';
}

export interface HookAnalysis {
  type: HookType;
  strength: 'strong' | 'moderate' | 'weak';
  elements: string[];
  suggestion?: string;
}

export type HookType = 
  | 'question'
  | 'statistic'
  | 'story'
  | 'controversy'
  | 'promise'
  | 'curiosity'
  | 'pain-point'
  | 'other';

export interface ToneAnalysis {
  primary: ToneType;
  secondary?: ToneType;
  consistency: number; // 0-1
  shifts?: ToneShift[];
}

export type ToneType = 
  | 'educational'
  | 'entertaining'
  | 'inspirational'
  | 'conversational'
  | 'professional'
  | 'urgent'
  | 'calm'
  | 'provocative';

export interface ToneShift {
  timestamp?: number;
  from: ToneType;
  to: ToneType;
  purpose?: string;
}

export interface NarrativeStructure {
  type: NarrativeType;
  phases: NarrativePhase[];
  effectiveness: number; // 0-1
}

export type NarrativeType = 
  | 'linear'
  | 'problem-solution'
  | 'before-after'
  | 'list'
  | 'story-arc'
  | 'comparison';

export interface NarrativePhase {
  name: string;
  description: string;
  durationPercent?: number;
}

export interface EngagementLogic {
  primaryDrivers: string[];
  emotionalTriggers: string[];
  callToAction?: string;
  retentionTechniques: string[];
}

export interface InsightCreateInput {
  contentId: UUID;
  promptId: UUID;
}

export interface InsightFilters {
  contentId?: UUID;
  status?: InsightStatus;
  minConfidence?: number;
}
