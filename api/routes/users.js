import { Hono } from "hono";
import { verify } from "hono/jwt";

const usersRouter = new Hono();

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

// Apply auth middleware to all routes
usersRouter.use("*", authenticate);

// GET /users/me (alias for /auth/me)
usersRouter.get("/me", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const users = await sql`SELECT id, email, name, role, avatar_url, preferences, created_at FROM users WHERE id = ${userId}`;
  if (users.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }
  
  const user = users[0];
  
  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      avatarUrl: user.avatar_url,
      preferences: user.preferences,
      createdAt: user.created_at,
    },
  });
});

// PATCH /users/me
usersRouter.patch("/me", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const body = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  const { name, avatarUrl } = body;
  const now = new Date().toISOString();
  
  if (name) {
    await sql`UPDATE users SET name = ${name}, updated_at = ${now} WHERE id = ${userId}`;
  }
  if (avatarUrl !== undefined) {
    await sql`UPDATE users SET avatar_url = ${avatarUrl}, updated_at = ${now} WHERE id = ${userId}`;
  }
  
  const users = await sql`SELECT id, email, name, role, avatar_url, preferences, created_at FROM users WHERE id = ${userId}`;
  const user = users[0];
  
  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      avatarUrl: user.avatar_url,
      preferences: user.preferences,
      createdAt: user.created_at,
    },
  });
});

// PUT /users/me/preferences
usersRouter.put("/me/preferences", async (c) => {
  const userId = c.get("userId");
  const sql = c.env.SQL;
  const preferences = await c.req.json();
  
  if (!sql) {
    return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
  }
  
  // Get current preferences and merge
  const users = await sql`SELECT preferences FROM users WHERE id = ${userId}`;
  if (users.length === 0) {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
  }
  
  const currentPrefs = users[0].preferences || {};
  const updatedPrefs = { ...currentPrefs, ...preferences };
  const now = new Date().toISOString();
  
  await sql`UPDATE users SET preferences = ${JSON.stringify(updatedPrefs)}, updated_at = ${now} WHERE id = ${userId}`;
  
  const updatedUsers = await sql`SELECT id, email, name, role, avatar_url, preferences, created_at FROM users WHERE id = ${userId}`;
  const user = updatedUsers[0];
  
  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      avatarUrl: user.avatar_url,
      preferences: user.preferences,
      createdAt: user.created_at,
    },
  });
});

export default usersRouter;
