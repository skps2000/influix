import type { UUID, Timestamps } from '../common';
import type { InsightAnalysis } from './insight';

/**
 * AI Prompt Engine - Critical Component
 * 
 * Design principles:
 * - Separate system intent from analysis instruction from output schema
 * - Output must be valid JSON (schema enforced)
 * - Never rely on free-form text output
 * - Version all prompts for reproducibility
 */
export interface AIPrompt extends Timestamps {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  category: PromptCategory;
  template: PromptTemplate;
}

export type PromptCategory = 
  | 'content-analysis'
  | 'hook-detection'
  | 'tone-analysis'
  | 'narrative-structure'
  | 'engagement-logic'
  | 'comparison'
  | 'custom';

export interface PromptTemplate {
  systemIntent: string;
  analysisInstruction: string;
  outputSchema: OutputSchema;
  examples?: PromptExample[];
  constraints?: string[];
}

/**
 * JSON Schema definition for AI output validation
 * Ensures deterministic, parseable outputs
 */
export interface OutputSchema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
  required: string[];
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  items?: SchemaProperty; // For arrays
  properties?: Record<string, SchemaProperty>; // For objects
  enum?: string[]; // For constrained strings
}

export interface PromptExample {
  input: string;
  output: Partial<InsightAnalysis>;
  explanation?: string;
}

export interface AIPromptCreateInput {
  name: string;
  slug: string;
  description: string;
  category: PromptCategory;
  template: PromptTemplate;
}

export interface AIPromptUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  template?: Partial<PromptTemplate>;
}

/**
 * AI Inference request
 */
export interface AIInferenceRequest {
  promptId: UUID;
  input: AIInferenceInput;
  options?: AIInferenceOptions;
}

export interface AIInferenceInput {
  content: string;
  metadata?: Record<string, unknown>;
  context?: string;
}

export interface AIInferenceOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIInferenceResponse {
  success: boolean;
  result?: InsightAnalysis;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}
