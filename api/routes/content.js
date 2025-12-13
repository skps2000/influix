import { Hono } from "hono";
import { verify } from "hono/jwt";

const contentRouter = new Hono();

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

contentRouter.use("*", authenticate);

// GET /content - Get all content for user's workspaces
contentRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const { workspaceId, status, platform, limit = 50, offset = 0 } = c.req.query();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  let query;
  if (workspaceId) {
    query = sql`
      SELECT c.* FROM content c
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId} AND c.workspace_id = ${workspaceId}
      ORDER BY c.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  } else {
    query = sql`
      SELECT c.* FROM content c
      INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  }
  
  const content = await query;
  
  return c.json({
    success: true,
    data: content.map(item => ({
      id: item.id,
      title: item.title,
      sourceUrl: item.source_url,
      sourceType: item.source_type?.toLowerCase(),
      platform: item.platform?.toLowerCase(),
      metadata: item.metadata,
      status: item.status?.toLowerCase(),
      workspaceId: item.workspace_id,
      creatorId: item.creator_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  });
});

// POST /content - Create new content
contentRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const body = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const { workspaceId, title, sourceUrl, sourceType, platform, metadata } = body;
  
  if (!workspaceId || !title || !sourceUrl) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "workspaceId, title, and sourceUrl are required" } }, 400);
  }
  
  // Verify user has access to workspace
  const access = await sql`
    SELECT 1 FROM workspace_members WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;
  if (access.length === 0) {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "No access to workspace" } }, 403);
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await sql`
    INSERT INTO content (id, workspace_id, creator_id, title, source_url, source_type, platform, metadata, status, created_at, updated_at)
    VALUES (${id}, ${workspaceId}, ${userId}, ${title}, ${sourceUrl}, ${(sourceType || 'VIDEO').toUpperCase()}, ${(platform || 'YOUTUBE').toUpperCase()}, ${JSON.stringify(metadata || {})}, 'PENDING', ${now}, ${now})
  `;
  
  return c.json({
    success: true,
    data: {
      id,
      title,
      sourceUrl,
      sourceType: (sourceType || 'video').toLowerCase(),
      platform: (platform || 'youtube').toLowerCase(),
      metadata: metadata || {},
      status: 'pending',
      workspaceId,
      creatorId: userId,
      createdAt: now,
    },
  }, 201);
});

// GET /content/:id
contentRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const contentId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const content = await sql`
    SELECT c.* FROM content c
    INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
    WHERE c.id = ${contentId} AND wm.user_id = ${userId}
  `;
  
  if (content.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Content not found" } }, 404);
  }
  
  const item = content[0];
  
  return c.json({
    success: true,
    data: {
      id: item.id,
      title: item.title,
      sourceUrl: item.source_url,
      sourceType: item.source_type?.toLowerCase(),
      platform: item.platform?.toLowerCase(),
      metadata: item.metadata,
      status: item.status?.toLowerCase(),
      workspaceId: item.workspace_id,
      creatorId: item.creator_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    },
  });
});

// DELETE /content/:id
contentRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const contentId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  // Verify access
  const content = await sql`
    SELECT c.id FROM content c
    INNER JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
    WHERE c.id = ${contentId} AND wm.user_id = ${userId}
  `;
  
  if (content.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Content not found" } }, 404);
  }
  
  await sql`DELETE FROM content WHERE id = ${contentId}`;
  
  return c.json({ success: true, data: { message: "Content deleted" } });
});

export default contentRouter;
