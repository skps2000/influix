import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import type { Insight } from '@influix/types';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

/**
 * GET /dashboard
 * Get dashboard data
 * "Show what matters today, contain AI-generated insight blocks, avoid useless charts"
 */
dashboardRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Dashboard data structure following product philosophy:
    // - Less UI, more meaning
    // - Fewer metrics, stronger interpretation
    // - AI should explain "why", not just "what"
    
    const dashboardData = {
      greeting: getGreeting(),
      todaysFocus: null, // AI-generated focus for today
      recentInsights: [], // Latest AI insights
      contentStats: {
        totalAnalyzed: 0,
        pendingAnalysis: 0,
        thisWeek: 0,
      },
      topPatterns: [], // Most common patterns found
      actionableItems: [], // Things the user can act on
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/insights
 * Get AI-generated insight blocks for dashboard
 */
dashboardRouter.get('/insights', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // AI-generated insights that explain "why" things work
    const insights: Insight[] = [];

    res.json({
      success: true,
      data: { insights },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/stats
 * Get minimal, meaningful statistics
 */
dashboardRouter.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = {
      // Meaningful metrics only
      contentAnalyzed: 0,
      insightsGenerated: 0,
      patternsDiscovered: 0,
      notesCreated: 0,
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
