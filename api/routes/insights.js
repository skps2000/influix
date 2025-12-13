import { Hono } from "hono";
import { verify } from "hono/jwt";

const insightsRouter = new Hono();

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

insightsRouter.use("*", authenticate);

// GET /insights
insightsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const { contentId, workspaceId, limit = 50, offset = 0 } = c.req.query();
  
  if (!sql) {
    return c.json({ success: true, data: [] });
  }
  
  let insights;
  if (contentId) {
    insights = await sql`
      SELECT i.* FROM insights i
      INNER JOIN content c ON i.content_id = c.id
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId} AND i.content_id = ${contentId}
      ORDER BY i.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  } else if (workspaceId) {
    insights = await sql`
      SELECT i.* FROM insights i
      INNER JOIN content c ON i.content_id = c.id
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId} AND i.workspace_id = ${workspaceId}
      ORDER BY i.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  } else {
    insights = await sql`
      SELECT i.* FROM insights i
      INNER JOIN content c ON i.content_id = c.id
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY i.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  }
  
  return c.json({
    success: true,
    data: insights.map(insight => ({
      id: insight.id,
      contentId: insight.content_id,
      workspaceId: insight.workspace_id,
      promptId: insight.prompt_id,
      promptVersion: insight.prompt_version,
      analysis: insight.analysis,
      confidence: insight.confidence,
      status: insight.status?.toLowerCase(),
      createdAt: insight.created_at,
      updatedAt: insight.updated_at,
    })),
  });
});

// GET /insights/:id
insightsRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const insightId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Insight not found" } }, 404);
  }
  
  const insights = await sql`
    SELECT i.* FROM insights i
    INNER JOIN content c ON i.content_id = c.id
    INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
    WHERE i.id = ${insightId} AND wm.user_id = ${userId}
  `;
  
  if (insights.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Insight not found" } }, 404);
  }
  
  const insight = insights[0];
  
  return c.json({
    success: true,
    data: {
      id: insight.id,
      contentId: insight.content_id,
      workspaceId: insight.workspace_id,
      promptId: insight.prompt_id,
      promptVersion: insight.prompt_version,
      analysis: insight.analysis,
      confidence: insight.confidence,
      status: insight.status?.toLowerCase(),
      createdAt: insight.created_at,
      updatedAt: insight.updated_at,
    },
  });
});

// POST /insights/generate - Generate insights for content
insightsRouter.post("/generate", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const { contentId } = await c.req.json();
  
  if (!contentId) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "contentId is required" } }, 400);
  }
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  // Verify access
  const content = await sql`
    SELECT c.* FROM content c
    INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
    WHERE c.id = ${contentId} AND wm.user_id = ${userId}
  `;
  
  if (content.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Content not found" } }, 404);
  }
  
  // For now, return a placeholder insight
  // In future, this will call AI service
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await sql`
    INSERT INTO insights (id, content_id, workspace_id, prompt_id, prompt_version, analysis, confidence, status, created_at, updated_at)
    VALUES (${id}, ${contentId}, ${content[0].workspace_id}, ${crypto.randomUUID()}, 1, '{"summary":"Analysis pending..."}', 0.5, 'GENERATING', ${now}, ${now})
  `;
  
  return c.json({
    success: true,
    data: {
      id,
      contentId,
      workspaceId: content[0].workspace_id,
      status: "generating",
      createdAt: now,
    },
  }, 202);
});

export default insightsRouter;
