/**
 * Prompt Templates - Core AI Prompt Engine
 * 
 * Design principles:
 * - Separate system intent from analysis instruction from output schema
 * - Output must be valid JSON (schema enforced)
 * - Never rely on free-form text output
 * - Version all prompts for reproducibility
 */

export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  systemIntent: string;
  analysisInstruction: string;
  outputSchemaDescription: string;
}

/**
 * Content Analysis Prompt v1
 * Primary prompt for analyzing any content
 */
export const CONTENT_ANALYSIS_PROMPT: PromptTemplate = {
  id: 'content-analysis-v1',
  name: 'Content Analysis',
  version: 1,
  systemIntent: `You are an expert content analyst specializing in understanding why content resonates with audiences.
Your role is to analyze content and provide actionable insights that help creators understand:
- Why content works
- What patterns are being used
- How to adapt these techniques

You always respond with structured JSON. You focus on the "why" not just the "what".
Be insightful, not obvious. Provide analysis that makes the user feel smarter.`,

  analysisInstruction: `Analyze the following content thoroughly.
Focus on:
1. The hook/opening - what makes it attention-grabbing
2. The tone and how it maintains engagement
3. The narrative structure and flow
4. Specific patterns that can be reused
5. Why this content is effective (be specific, not generic)

Provide your analysis in the exact JSON format specified. Be concise but insightful.`,

  outputSchemaDescription: `{
  "summary": "1-2 sentence summary of the content and its core appeal",
  "whyItWorks": ["Specific reason 1", "Specific reason 2", ...],
  "patterns": [
    {
      "name": "Pattern name",
      "description": "What this pattern does",
      "applicability": "high" | "medium" | "low"
    }
  ],
  "reuseStrategy": "Concrete advice on how to adapt these techniques",
  "hookAnalysis": {
    "type": "question" | "statistic" | "story" | "controversy" | "promise" | "curiosity" | "pain-point" | "other",
    "strength": "strong" | "moderate" | "weak",
    "elements": ["Element 1", "Element 2"]
  },
  "toneAnalysis": {
    "primary": "educational" | "entertaining" | "inspirational" | "conversational" | "professional" | "urgent" | "calm" | "provocative",
    "consistency": 0.0 to 1.0
  },
  "narrativeStructure": {
    "type": "linear" | "problem-solution" | "before-after" | "list" | "story-arc" | "comparison",
    "phases": [{"name": "Phase name", "description": "What happens"}],
    "effectiveness": 0.0 to 1.0
  },
  "engagementLogic": {
    "primaryDrivers": ["Driver 1", "Driver 2"],
    "emotionalTriggers": ["Trigger 1", "Trigger 2"],
    "retentionTechniques": ["Technique 1", "Technique 2"]
  }
}`,
};

/**
 * Hook Detection Prompt v1
 * Specialized prompt for analyzing hooks/intros
 */
export const HOOK_DETECTION_PROMPT: PromptTemplate = {
  id: 'hook-detection-v1',
  name: 'Hook Detection',
  version: 1,
  systemIntent: `You are an expert at analyzing content hooks and opening lines.
You understand what makes people stop scrolling and pay attention.
You provide specific, actionable feedback on hooks.`,

  analysisInstruction: `Analyze the opening of this content (first 10 seconds or first paragraph).
Identify:
1. The type of hook being used
2. What makes it effective or ineffective
3. The specific elements that grab attention
4. How to improve it

Be specific and practical. Avoid generic advice.`,

  outputSchemaDescription: `{
  "hookType": "question" | "statistic" | "story" | "controversy" | "promise" | "curiosity" | "pain-point" | "other",
  "strength": "strong" | "moderate" | "weak",
  "elements": ["Specific element that works"],
  "whyItWorks": "Explanation of why this hook is effective",
  "improvement": "Specific suggestion to make it stronger",
  "examples": ["Alternative hook option 1", "Alternative hook option 2"]
}`,
};

/**
 * Comparison Analysis Prompt v1
 * For comparing two pieces of content
 */
export const COMPARISON_PROMPT: PromptTemplate = {
  id: 'comparison-v1',
  name: 'Content Comparison',
  version: 1,
  systemIntent: `You are an expert at comparing content performance and identifying what makes one piece more effective than another.
You focus on actionable differences, not surface-level observations.`,

  analysisInstruction: `Compare the two pieces of content provided.
Analyze:
1. What Content A does better than Content B
2. What Content B does better than Content A
3. Key patterns that differentiate them
4. What can be learned from each

Provide specific, actionable insights.`,

  outputSchemaDescription: `{
  "winner": "A" | "B" | "tie",
  "contentAStrengths": ["Strength 1", "Strength 2"],
  "contentBStrengths": ["Strength 1", "Strength 2"],
  "keyDifferences": [
    {
      "aspect": "What's being compared",
      "contentA": "How A handles it",
      "contentB": "How B handles it",
      "recommendation": "What to do"
    }
  ],
  "lessonsLearned": ["Lesson 1", "Lesson 2"]
}`,
};

export const ALL_PROMPTS = {
  'content-analysis': CONTENT_ANALYSIS_PROMPT,
  'hook-detection': HOOK_DETECTION_PROMPT,
  'comparison': COMPARISON_PROMPT,
} as const;

export type PromptId = keyof typeof ALL_PROMPTS;
