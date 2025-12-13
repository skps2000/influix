import { AIClient, ChatMessage, CompletionResult } from './client';
import { InsightAnalysisSchema, InsightAnalysis } from './schemas';
import { ALL_PROMPTS, PromptId, PromptTemplate } from './prompts';
import type { AIInferenceRequest, AIInferenceResponse } from '@influix/types';

/**
 * AI Inference Engine
 * Orchestrates prompt execution with schema validation
 */
export class InferenceEngine {
  private client: AIClient;

  constructor(client: AIClient) {
    this.client = client;
  }

  /**
   * Analyze content using a specific prompt template
   */
  async analyzeContent(
    content: string,
    promptId: PromptId = 'content-analysis',
    metadata?: Record<string, unknown>
  ): Promise<AIInferenceResponse> {
    const prompt = ALL_PROMPTS[promptId];
    return this.executePrompt(prompt, content, metadata);
  }

  /**
   * Execute a prompt template with content
   */
  async executePrompt(
    prompt: PromptTemplate,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<AIInferenceResponse> {
    const messages = this.buildMessages(prompt, content, metadata);
    
    const result = await this.client.complete({
      messages,
      jsonMode: true,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'AI inference failed',
        latencyMs: result.latencyMs,
      };
    }

    // Parse and validate the response
    const parsed = this.parseResponse(result.content);
    
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error,
        latencyMs: result.latencyMs,
      };
    }

    return {
      success: true,
      result: parsed.data,
      usage: result.usage,
      latencyMs: result.latencyMs,
    };
  }

  /**
   * Build chat messages from prompt template
   */
  private buildMessages(
    prompt: PromptTemplate,
    content: string,
    metadata?: Record<string, unknown>
  ): ChatMessage[] {
    const systemMessage = `${prompt.systemIntent}

${prompt.analysisInstruction}

You MUST respond with valid JSON matching this exact schema:
${prompt.outputSchemaDescription}`;

    let userMessage = `Content to analyze:
---
${content}
---`;

    if (metadata) {
      userMessage += `

Additional context:
${JSON.stringify(metadata, null, 2)}`;
    }

    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ];
  }

  /**
   * Parse and validate AI response
   */
  private parseResponse(content: string): ParseResult {
    try {
      const json = JSON.parse(content);
      const validated = InsightAnalysisSchema.parse(json);
      return { success: true, data: validated };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse AI response: ${(error as Error).message}`,
      };
    }
  }
}

interface ParseResult {
  success: boolean;
  data?: InsightAnalysis;
  error?: string;
}

/**
 * Create inference engine with API key
 */
export function createInferenceEngine(apiKey: string, baseURL?: string): InferenceEngine {
  const client = new AIClient({ apiKey, baseURL });
  return new InferenceEngine(client);
}
