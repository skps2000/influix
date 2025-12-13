import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { contentService } from '../services/contentService';
import { workspaceService } from '../services/workspaceService';
import { Errors } from '../middleware/errorHandler';
import { z } from 'zod';
import { CONTENT } from '@influix/config';

export const contentRouter = Router();

contentRouter.use(authenticate);

const createContentSchema = z.object({
  title: z.string().min(1).max(CONTENT.MAX_TITLE_LENGTH),
  sourceUrl: z.string().url().optional(),
  sourceType: z.enum(['video', 'image', 'text', 'audio', 'mixed']),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'other']),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * GET /content
 * List content items
 */
contentRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 20, platform, status } = req.query;
    
    const content = await contentService.list({
      userId: req.userId!,
      page: Number(page),
      pageSize: Number(pageSize),
      platform: platform as string,
      status: status as string,
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content
 * Create new content item
 */
contentRouter.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = createContentSchema.safeParse(req.body);
    if (!validation.success) {
      throw Errors.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), e.message])
        )
      );
    }

    // Get or create default workspace for user
    const workspace = await workspaceService.getOrCreateDefaultWorkspace(req.userId!);

    const content = await contentService.create({
      ...validation.data,
      createdBy: req.userId!,
      workspaceId: workspace.id,
    });

    res.status(201).json({
      success: true,
      data: { content },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /content/:id
 * Get content by ID
 */
contentRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const content = await contentService.findById(req.params.id);
    if (!content) {
      throw Errors.notFound('Content');
    }

    res.json({
      success: true,
      data: { content },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /content/:id/analyze
 * Trigger AI analysis for content
 */
contentRouter.post('/:id/analyze', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const content = await contentService.findById(req.params.id);
    if (!content) {
      throw Errors.notFound('Content');
    }

    // Trigger analysis (async operation)
    const insight = await contentService.analyze(req.params.id);

    res.json({
      success: true,
      data: { insight },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /content/:id/insights
 * Get insights for content
 */
contentRouter.get('/:id/insights', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const insights = await contentService.getInsights(req.params.id);

    res.json({
      success: true,
      data: { insights },
    });
  } catch (error) {
    next(error);
  }
});
