import { Hono } from "hono";
import { verify } from "hono/jwt";

const dashboardRouter = new Hono();

// Auth middleware
async function authenticate(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "No token provided" } }, 401);
  }
  
  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET || "default-secret-change-me";
  
  try {
    const decoded = await verify(token, secret);
    if (decoded.type !== "access") {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, 401);
    }
    c.set("userId", decoded.userId);
    await next();
  } catch (error) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, 401);
  }
}

dashboardRouter.use("*", authenticate);

// GET /dashboard - Get dashboard overview
dashboardRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  
  if (!sql) {
    // Return mock data if no database
    return c.json({
      success: true,
      data: {
        stats: {
          totalContent: 0,
          totalNotes: 0,
          totalWorkspaces: 0,
          recentActivity: [],
        },
      },
    });
  }
  
  try {
    // Get counts
    const contentCount = await sql`
      SELECT COUNT(*) as count FROM content c
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
    `;
    
    const notesCount = await sql`
      SELECT COUNT(*) as count FROM notes n
      INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
    `;
    
    const workspacesCount = await sql`
      SELECT COUNT(*) as count FROM workspace_members WHERE user_id = ${userId}
    `;
    
    // Get recent content
    const recentContent = await sql`
      SELECT c.id, c.title, c.created_at, 'content' as type FROM content c
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 5
    `;
    
    // Get recent notes
    const recentNotes = await sql`
      SELECT n.id, n.title, n.created_at, 'note' as type FROM notes n
      INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 5
    `;
    
    // Combine and sort recent activity
    const recentActivity = [...recentContent, ...recentNotes]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
    
    return c.json({
      success: true,
      data: {
        stats: {
          totalContent: parseInt(contentCount[0]?.count || 0),
          totalNotes: parseInt(notesCount[0]?.count || 0),
          totalWorkspaces: parseInt(workspacesCount[0]?.count || 0),
          recentActivity: recentActivity.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            createdAt: item.created_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return c.json({
      success: true,
      data: {
        stats: {
          totalContent: 0,
          totalNotes: 0,
          totalWorkspaces: 0,
          recentActivity: [],
        },
      },
    });
  }
});

// GET /dashboard/insights
dashboardRouter.get("/insights", async (c) => {
  // Return empty insights for now (AI-generated in future)
  return c.json({
    success: true,
    data: {
      insights: [],
    },
  });
});

export default dashboardRouter;
