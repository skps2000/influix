import prisma from '../lib/prisma';
import type { Content, ContentCreateInput, ContentUpdateInput, Insight } from '@influix/types';
import { createInferenceEngine } from '@influix/ai';

/**
 * Content Service - Business logic for content management
 * Connected to Supabase PostgreSQL via Prisma
 */

interface ListOptions {
  userId: string;
  workspaceId?: string;
  page: number;
  pageSize: number;
  platform?: string;
  status?: string;
}

export const contentService = {
  async create(input: ContentCreateInput & { createdBy: string; workspaceId: string }): Promise<Content> {
    const content = await prisma.content.create({
      data: {
        workspaceId: input.workspaceId,
        createdById: input.createdBy,
        title: input.title,
        sourceUrl: input.sourceUrl,
        sourceType: input.sourceType.toUpperCase() as any,
        platform: input.platform.toUpperCase() as any,
        metadata: input.metadata || {},
        status: 'PENDING',
      },
    });

    return mapPrismaContentToContent(content);
  },

  async findById(id: string): Promise<Content | null> {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) return null;
    return mapPrismaContentToContent(content);
  },

  async list(options: ListOptions) {
    const { userId, workspaceId, page, pageSize, platform, status } = options;

    const where: any = {
      createdById: userId,
    };

    if (workspaceId) where.workspaceId = workspaceId;
    if (platform) where.platform = platform.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.content.count({ where }),
    ]);

    return {
      data: items.map(mapPrismaContentToContent),
      total,
      page,
      pageSize,
      hasMore: (page - 1) * pageSize + items.length < total,
    };
  },

  async update(id: string, input: ContentUpdateInput): Promise<Content | null> {
    const content = await prisma.content.update({
      where: { id },
      data: {
        title: input.title,
        metadata: input.metadata,
        status: input.status?.toUpperCase() as any,
      },
    });

    return mapPrismaContentToContent(content);
  },

  async analyze(id: string): Promise<Insight | null> {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) return null;

    // Update status to analyzing
    await prisma.content.update({
      where: { id },
      data: { status: 'ANALYZING' },
    });

    // Get default prompt
    const prompt = await prisma.aIPrompt.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (!prompt) {
      await prisma.content.update({
        where: { id },
        data: { status: 'FAILED' },
      });
      return null;
    }

    // Run AI analysis if API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    let analysis: any = {
      summary: 'Analysis pending - configure OPENAI_API_KEY to enable',
      whyItWorks: [],
      patterns: [],
      reuseStrategy: '',
    };
    let confidence = 0;
    let insightStatus: 'COMPLETE' | 'FAILED' | 'GENERATING' = 'GENERATING';

    if (apiKey && apiKey !== 'your-openai-api-key') {
      try {
        const engine = createInferenceEngine(apiKey);
        const contentText = content.transcript || content.title;
        const result = await engine.analyzeContent(contentText);

        if (result.success && result.result) {
          analysis = result.result;
          confidence = 0.85;
          insightStatus = 'COMPLETE';
        } else {
          insightStatus = 'FAILED';
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
        insightStatus = 'FAILED';
      }
    }

    // Create insight
    const insight = await prisma.insight.create({
      data: {
        contentId: id,
        workspaceId: content.workspaceId,
        promptId: prompt.id,
        promptVersion: prompt.version,
        analysis,
        confidence,
        status: insightStatus,
      },
    });

    // Update content status
    await prisma.content.update({
      where: { id },
      data: {
        status: insightStatus === 'COMPLETE' ? 'ANALYZED' : 'FAILED',
        lastAnalyzedAt: new Date(),
      },
    });

    return mapPrismaInsightToInsight(insight);
  },

  async getInsights(contentId: string): Promise<Insight[]> {
    const insights = await prisma.insight.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    });

    return insights.map(mapPrismaInsightToInsight);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.content.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },
};

// Helper functions
function mapPrismaContentToContent(content: any): Content {
  return {
    id: content.id,
    workspaceId: content.workspaceId,
    createdBy: content.createdById,
    title: content.title,
    sourceUrl: content.sourceUrl || undefined,
    sourceType: content.sourceType.toLowerCase() as any,
    platform: content.platform.toLowerCase() as any,
    metadata: content.metadata,
    status: content.status.toLowerCase() as any,
    lastAnalyzedAt: content.lastAnalyzedAt?.toISOString(),
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt.toISOString(),
  };
}

function mapPrismaInsightToInsight(insight: any): Insight {
  return {
    id: insight.id,
    contentId: insight.contentId,
    workspaceId: insight.workspaceId,
    promptId: insight.promptId,
    promptVersion: insight.promptVersion,
    analysis: insight.analysis,
    confidence: insight.confidence,
    status: insight.status.toLowerCase() as any,
    createdAt: insight.createdAt.toISOString(),
    updatedAt: insight.updatedAt.toISOString(),
  };
}
