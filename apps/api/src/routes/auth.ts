import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Errors } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { userService } from '../services/userService';
import { AUTH } from '@influix/config';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(AUTH.PASSWORD_MIN_LENGTH).max(AUTH.PASSWORD_MAX_LENGTH),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /auth/register
 * Register a new user
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw Errors.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), e.message])
        )
      );
    }

    const { email, name, password } = validation.data;

    // Check if user exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      throw Errors.conflict('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await userService.create({
      email,
      name,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login with email and password
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw Errors.badRequest('Invalid credentials');
    }

    const { email, password } = validation.data;

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      throw Errors.unauthorized('Invalid credentials');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw Errors.unauthorized('Invalid credentials');
    }

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw Errors.badRequest('Refresh token required');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(refreshToken, secret) as { userId: string; type: string };
    if (decoded.type !== 'refresh') {
      throw Errors.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Get current user
 */
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.findById(req.userId!);
    if (!user) {
      throw Errors.notFound('User');
    }

    res.json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal, optional server-side invalidation)
 */
authRouter.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  // In a production app, you might want to invalidate the token server-side
  res.json({ success: true });
});

// Helper functions
function generateTokens(userId: string) {
  const secret = process.env.JWT_SECRET!;
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    secret,
    { expiresIn: AUTH.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    secret,
    { expiresIn: AUTH.REFRESH_TOKEN_EXPIRY }
  );

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000 // 15 minutes
  ).toISOString();

  return { accessToken, refreshToken, expiresAt };
}

function sanitizeUser(user: any) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}
