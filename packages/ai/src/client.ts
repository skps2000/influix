import OpenAI from 'openai';
import { AI } from '@influix/config';

export interface AIClientConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  defaultTemperature?: number;
  maxRetries?: number;
}

/**
 * OpenAI-compatible client wrapper
 * Abstracted to support any OpenAI-compatible interface
 */
export class AIClient {
  private client: OpenAI;
  private model: string;
  private defaultTemperature: number;
  private maxRetries: number;

  constructor(config: AIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model || AI.DEFAULT_MODEL;
    this.defaultTemperature = config.defaultTemperature ?? AI.DEFAULT_TEMPERATURE;
    this.maxRetries = config.maxRetries ?? AI.RETRY_ATTEMPTS;
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: options.model || this.model,
          messages: options.messages,
          temperature: options.temperature ?? this.defaultTemperature,
          max_tokens: options.maxTokens || AI.MAX_TOKENS,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
        });

        const content = response.choices[0]?.message?.content || '';
        const latencyMs = Date.now() - startTime;

        return {
          success: true,
          content,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          latencyMs,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(AI.RETRY_DELAY_MS * (attempt + 1));
        }
      }
    }

    return {
      success: false,
      content: '',
      error: lastError?.message || 'Unknown error',
      latencyMs: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export interface CompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionResult {
  success: boolean;
  content: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}
