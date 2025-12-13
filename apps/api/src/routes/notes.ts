import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { noteService } from '../services/noteService';
import { workspaceService } from '../services/workspaceService';
import { Errors } from '../middleware/errorHandler';
import { z } from 'zod';

export const noteRouter = Router();

noteRouter.use(authenticate);

const createNoteSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string(),
  contentId: z.string().uuid().optional(),
  insightId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
});

/**
 * GET /notes
 * List notes
 */
noteRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 20, search, tags, isArchived } = req.query;
    
    const notes = await noteService.list({
      userId: req.userId!,
      page: Number(page),
      pageSize: Number(pageSize),
      search: search as string,
      tags: tags ? (tags as string).split(',') : undefined,
      isArchived: isArchived === 'true',
    });

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /notes
 * Create a new note
 */
noteRouter.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = createNoteSchema.safeParse(req.body);
    if (!validation.success) {
      throw Errors.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), e.message])
        )
      );
    }

    // Get or create default workspace for user
    const workspace = await workspaceService.getOrCreateDefaultWorkspace(req.userId!);

    const note = await noteService.create({
      ...validation.data,
      createdBy: req.userId!,
      workspaceId: workspace.id,
    });

    res.status(201).json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /notes/:id
 * Get note by ID
 */
noteRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const note = await noteService.findById(req.params.id);
    if (!note) {
      throw Errors.notFound('Note');
    }

    res.json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /notes/:id
 * Update a note
 */
noteRouter.patch('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = updateNoteSchema.safeParse(req.body);
    if (!validation.success) {
      throw Errors.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), e.message])
        )
      );
    }

    const note = await noteService.update(req.params.id, validation.data);

    res.json({
      success: true,
      data: { note },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /notes/:id
 * Delete a note
 */
noteRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await noteService.delete(req.params.id);

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});
