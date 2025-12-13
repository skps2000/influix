import { z } from 'zod';

/**
 * Zod schemas for AI output validation
 * Ensures deterministic, parseable outputs
 * Never rely on free-form text output
 */

export const PatternSchema = z.object({
  name: z.string().describe('Name of the pattern'),
  description: z.string().describe('What this pattern does'),
  examples: z.array(z.string()).optional().describe('Examples of usage'),
  applicability: z.enum(['high', 'medium', 'low']).describe('How applicable this pattern is'),
});

export const HookAnalysisSchema = z.object({
  type: z.enum([
    'question',
    'statistic',
    'story',
    'controversy',
    'promise',
    'curiosity',
    'pain-point',
    'other',
  ]).describe('Type of hook used'),
  strength: z.enum(['strong', 'moderate', 'weak']).describe('How effective the hook is'),
  elements: z.array(z.string()).describe('Key elements that make the hook work'),
  suggestion: z.string().optional().describe('How to improve the hook'),
});

export const ToneTypeEnum = z.enum([
  'educational',
  'entertaining',
  'inspirational',
  'conversational',
  'professional',
  'urgent',
  'calm',
  'provocative',
]);

export const ToneShiftSchema = z.object({
  timestamp: z.number().optional().describe('When the shift occurs (in seconds)'),
  from: ToneTypeEnum.describe('Original tone'),
  to: ToneTypeEnum.describe('New tone'),
  purpose: z.string().optional().describe('Why this shift was made'),
});

export const ToneAnalysisSchema = z.object({
  primary: ToneTypeEnum.describe('Primary tone of the content'),
  secondary: ToneTypeEnum.optional().describe('Secondary tone if present'),
  consistency: z.number().min(0).max(1).describe('How consistent the tone is (0-1)'),
  shifts: z.array(ToneShiftSchema).optional().describe('Notable tone shifts'),
});

export const NarrativePhaseSchema = z.object({
  name: z.string().describe('Name of this narrative phase'),
  description: z.string().describe('What happens in this phase'),
  durationPercent: z.number().min(0).max(100).optional().describe('Percentage of content'),
});

export const NarrativeStructureSchema = z.object({
  type: z.enum([
    'linear',
    'problem-solution',
    'before-after',
    'list',
    'story-arc',
    'comparison',
  ]).describe('Type of narrative structure'),
  phases: z.array(NarrativePhaseSchema).describe('Phases of the narrative'),
  effectiveness: z.number().min(0).max(1).describe('How effective the structure is (0-1)'),
});

export const EngagementLogicSchema = z.object({
  primaryDrivers: z.array(z.string()).describe('Main engagement drivers'),
  emotionalTriggers: z.array(z.string()).describe('Emotional triggers used'),
  callToAction: z.string().optional().describe('Call to action if present'),
  retentionTechniques: z.array(z.string()).describe('Techniques used to retain attention'),
});

/**
 * Complete insight analysis schema
 * This is the primary output format for content analysis
 */
export const InsightAnalysisSchema = z.object({
  summary: z.string().describe('Brief summary of the content and its impact'),
  whyItWorks: z.array(z.string()).describe('Key reasons why this content is effective'),
  patterns: z.array(PatternSchema).describe('Patterns identified in the content'),
  reuseStrategy: z.string().describe('How to adapt and reuse these techniques'),
  hookAnalysis: HookAnalysisSchema.optional().describe('Analysis of the hook/intro'),
  toneAnalysis: ToneAnalysisSchema.optional().describe('Analysis of the tone'),
  narrativeStructure: NarrativeStructureSchema.optional().describe('Analysis of the narrative structure'),
  engagementLogic: EngagementLogicSchema.optional().describe('Analysis of engagement techniques'),
});

export type InsightAnalysis = z.infer<typeof InsightAnalysisSchema>;
export type Pattern = z.infer<typeof PatternSchema>;
export type HookAnalysis = z.infer<typeof HookAnalysisSchema>;
export type ToneAnalysis = z.infer<typeof ToneAnalysisSchema>;
export type NarrativeStructure = z.infer<typeof NarrativeStructureSchema>;
export type EngagementLogic = z.infer<typeof EngagementLogicSchema>;
