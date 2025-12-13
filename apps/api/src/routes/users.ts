import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { userService } from '../services/userService';
import { Errors } from '../middleware/errorHandler';

export const userRouter = Router();

// All user routes require authentication
userRouter.use(authenticate);

/**
 * GET /users/:id
 * Get user by ID
 */
userRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw Errors.notFound('User');
    }

    // Only allow users to see their own profile or admins
    if (req.userId !== user.id) {
      throw Errors.forbidden();
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /users/:id
 * Update user profile
 */
userRouter.patch('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.userId !== req.params.id) {
      throw Errors.forbidden();
    }

    const { name, avatarUrl } = req.body;
    const user = await userService.update(req.params.id, { name, avatarUrl });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /users/:id/preferences
 * Update user preferences
 */
userRouter.patch('/:id/preferences', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.userId !== req.params.id) {
      throw Errors.forbidden();
    }

    const user = await userService.updatePreferences(req.params.id, req.body);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});
