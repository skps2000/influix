import { Hono } from "hono";
import { verify } from "hono/jwt";

const workspacesRouter = new Hono();

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

workspacesRouter.use("*", authenticate);

// GET /workspaces - Get user's workspaces
workspacesRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const workspaces = await sql`
    SELECT w.id, w.name, w.slug, w.description, w.settings, w.created_at, wm.role
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ${userId}
    ORDER BY w.created_at DESC
  `;
  
  return c.json({
    success: true,
    data: workspaces.map(w => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      description: w.description,
      settings: w.settings,
      role: w.role.toLowerCase(),
      createdAt: w.created_at,
    })),
  });
});

// POST /workspaces - Create workspace
workspacesRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const { name, description } = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  if (!name) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name is required" } }, 400);
  }
  
  const id = crypto.randomUUID();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const now = new Date().toISOString();
  
  // Create workspace
  await sql`
    INSERT INTO workspaces (id, name, slug, description, owner_id, settings, created_at, updated_at)
    VALUES (${id}, ${name}, ${slug}, ${description || ""}, ${userId}, '{}', ${now}, ${now})
  `;
  
  // Add owner as member
  await sql`
    INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at)
    VALUES (${crypto.randomUUID()}, ${id}, ${userId}, 'OWNER', ${now})
  `;
  
  return c.json({
    success: true,
    data: {
      id,
      name,
      slug,
      description: description || "",
      settings: {},
      createdAt: now,
    },
  }, 201);
});

// GET /workspaces/default - Get or create default workspace
workspacesRouter.get("/default", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  // Check for existing workspace
  const workspaces = await sql`
    SELECT w.id, w.name, w.slug, w.description, w.settings, w.created_at
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ${userId}
    LIMIT 1
  `;
  
  if (workspaces.length > 0) {
    const w = workspaces[0];
    return c.json({
      success: true,
      data: {
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        settings: w.settings,
        createdAt: w.created_at,
      },
    });
  }
  
  // Create default workspace
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await sql`
    INSERT INTO workspaces (id, name, slug, description, owner_id, settings, created_at, updated_at)
    VALUES (${id}, 'My Workspace', 'my-workspace', 'Default workspace', ${userId}, '{}', ${now}, ${now})
  `;
  
  await sql`
    INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at)
    VALUES (${crypto.randomUUID()}, ${id}, ${userId}, 'OWNER', ${now})
  `;
  
  return c.json({
    success: true,
    data: {
      id,
      name: "My Workspace",
      slug: "my-workspace",
      description: "Default workspace",
      settings: {},
      createdAt: now,
    },
  }, 201);
});

// GET /workspaces/:id
workspacesRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const workspaceId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const workspaces = await sql`
    SELECT w.id, w.name, w.slug, w.description, w.settings, w.created_at, wm.role
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE w.id = ${workspaceId} AND wm.user_id = ${userId}
  `;
  
  if (workspaces.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Workspace not found" } }, 404);
  }
  
  const w = workspaces[0];
  
  return c.json({
    success: true,
    data: {
      id: w.id,
      name: w.name,
      slug: w.slug,
      description: w.description,
      settings: w.settings,
      role: w.role.toLowerCase(),
      createdAt: w.created_at,
    },
  });
});

export default workspacesRouter;
