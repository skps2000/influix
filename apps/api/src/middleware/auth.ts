import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Errors } from './errorHandler';
import type { User } from '@influix/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Errors.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(Errors.unauthorized('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(Errors.unauthorized('Token expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication - continues if no token, but validates if present
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  authenticate(req, res, next);
}
