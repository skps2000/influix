import { Hono } from "hono";
import { verify } from "hono/jwt";

const notesRouter = new Hono();

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

notesRouter.use("*", authenticate);

// GET /notes
notesRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const { workspaceId, contentId, limit = 50, offset = 0 } = c.req.query();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  let notes;
  if (contentId) {
    notes = await sql`
      SELECT n.* FROM notes n
      INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId} AND n.content_id = ${contentId}
      ORDER BY n.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  } else if (workspaceId) {
    notes = await sql`
      SELECT n.* FROM notes n
      INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId} AND n.workspace_id = ${workspaceId}
      ORDER BY n.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  } else {
    notes = await sql`
      SELECT n.* FROM notes n
      INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
  }
  
  return c.json({
    success: true,
    data: notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      contentId: note.content_id,
      workspaceId: note.workspace_id,
      authorId: note.author_id,
      tags: note.tags,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
  });
});

// POST /notes
notesRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const body = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const { workspaceId, contentId, title, content, tags } = body;
  
  if (!workspaceId || !title) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "workspaceId and title are required" } }, 400);
  }
  
  // Verify access
  const access = await sql`
    SELECT 1 FROM workspace_members WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;
  if (access.length === 0) {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "No access to workspace" } }, 403);
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await sql`
    INSERT INTO notes (id, workspace_id, content_id, author_id, title, content, tags, created_at, updated_at)
    VALUES (${id}, ${workspaceId}, ${contentId || null}, ${userId}, ${title}, ${content || ""}, ${JSON.stringify(tags || [])}, ${now}, ${now})
  `;
  
  return c.json({
    success: true,
    data: {
      id,
      title,
      content: content || "",
      contentId: contentId || null,
      workspaceId,
      authorId: userId,
      tags: tags || [],
      createdAt: now,
    },
  }, 201);
});

// GET /notes/:id
notesRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const noteId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const notes = await sql`
    SELECT n.* FROM notes n
    INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
    WHERE n.id = ${noteId} AND wm.user_id = ${userId}
  `;
  
  if (notes.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Note not found" } }, 404);
  }
  
  const note = notes[0];
  
  return c.json({
    success: true,
    data: {
      id: note.id,
      title: note.title,
      content: note.content,
      contentId: note.content_id,
      workspaceId: note.workspace_id,
      authorId: note.author_id,
      tags: note.tags,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    },
  });
});

// PATCH /notes/:id
notesRouter.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const noteId = c.req.param("id");
  const sql = c.env.SQL;
  const body = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  // Verify access
  const notes = await sql`
    SELECT n.* FROM notes n
    INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
    WHERE n.id = ${noteId} AND wm.user_id = ${userId}
  `;
  
  if (notes.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Note not found" } }, 404);
  }
  
  const { title, content, tags } = body;
  const now = new Date().toISOString();
  
  if (title !== undefined) {
    await sql`UPDATE notes SET title = ${title}, updated_at = ${now} WHERE id = ${noteId}`;
  }
  if (content !== undefined) {
    await sql`UPDATE notes SET content = ${content}, updated_at = ${now} WHERE id = ${noteId}`;
  }
  if (tags !== undefined) {
    await sql`UPDATE notes SET tags = ${JSON.stringify(tags)}, updated_at = ${now} WHERE id = ${noteId}`;
  }
  
  const updated = await sql`SELECT * FROM notes WHERE id = ${noteId}`;
  const note = updated[0];
  
  return c.json({
    success: true,
    data: {
      id: note.id,
      title: note.title,
      content: note.content,
      contentId: note.content_id,
      workspaceId: note.workspace_id,
      authorId: note.author_id,
      tags: note.tags,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    },
  });
});

// DELETE /notes/:id
notesRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const noteId = c.req.param("id");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const notes = await sql`
    SELECT n.id FROM notes n
    INNER JOIN workspace_members wm ON n.workspace_id = wm.workspace_id
    WHERE n.id = ${noteId} AND wm.user_id = ${userId}
  `;
  
  if (notes.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Note not found" } }, 404);
  }
  
  await sql`DELETE FROM notes WHERE id = ${noteId}`;
  
  return c.json({ success: true, data: { message: "Note deleted" } });
});

export default notesRouter;
