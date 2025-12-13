import { Hono } from "hono";
import { sign, verify } from "hono/jwt";

const authRouter = new Hono();

// Helper to hash password (using Web Crypto API for Workers)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to generate tokens
async function generateTokens(userId, secret) {
  const now = Math.floor(Date.now() / 1000);
  
  const accessToken = await sign(
    { userId, type: "access", exp: now + 15 * 60 }, // 15 minutes
    secret
  );
  
  const refreshToken = await sign(
    { userId, type: "refresh", exp: now + 7 * 24 * 60 * 60 }, // 7 days
    secret
  );
  
  return { accessToken, refreshToken };
}

// POST /auth/register
authRouter.post("/register", async (c) => {
  try {
    const { email, name, password } = await c.req.json();
    
    // Validation
    if (!email || !name || !password) {
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Email, name, and password are required" } }, 400);
    }
    
    if (password.length < 8) {
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } }, 400);
    }
    
    const sql = c.env.SQL;
    if (!sql) {
      return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
    }
    
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return c.json({ success: false, error: { code: "CONFLICT", message: "Email already registered" } }, 409);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await sql`
      INSERT INTO users (id, email, name, password_hash, role, preferences, created_at, updated_at)
      VALUES (${id}, ${email}, ${name}, ${passwordHash}, 'MEMBER', '{"theme":"dark","language":"en","notifications":{"email":true,"inApp":true,"digest":"weekly"}}', ${now}, ${now})
    `;
    
    // Generate tokens
    const secret = c.env.JWT_SECRET || "default-secret-change-me";
    const tokens = await generateTokens(id, secret);
    
    return c.json({
      success: true,
      data: {
        user: { id, email, name, role: "member" },
        tokens,
      },
    }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, 500);
  }
});

// POST /auth/login
authRouter.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Email and password are required" } }, 400);
    }
    
    const sql = c.env.SQL;
    if (!sql) {
      return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
    }
    
    // Find user
    const users = await sql`SELECT id, email, name, password_hash, role FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } }, 401);
    }
    
    const user = users[0];
    
    // Check password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid credentials" } }, 401);
    }
    
    // Update last login
    await sql`UPDATE users SET last_login_at = ${new Date().toISOString()} WHERE id = ${user.id}`;
    
    // Generate tokens
    const secret = c.env.JWT_SECRET || "default-secret-change-me";
    const tokens = await generateTokens(user.id, secret);
    
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
        },
        tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, 500);
  }
});

// POST /auth/refresh
authRouter.post("/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Refresh token required" } }, 400);
    }
    
    const secret = c.env.JWT_SECRET || "default-secret-change-me";
    
    const decoded = await verify(refreshToken, secret);
    if (decoded.type !== "refresh") {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid refresh token" } }, 401);
    }
    
    const tokens = await generateTokens(decoded.userId, secret);
    
    return c.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid refresh token" } }, 401);
  }
});

// GET /auth/me
authRouter.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "No token provided" } }, 401);
    }
    
    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET || "default-secret-change-me";
    
    const decoded = await verify(token, secret);
    if (decoded.type !== "access") {
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, 401);
    }
    
    const sql = c.env.SQL;
    if (!sql) {
      return c.json({ success: false, error: { code: "DB_ERROR", message: "Database not available" } }, 500);
    }
    
    const users = await sql`SELECT id, email, name, role, avatar_url, preferences, created_at FROM users WHERE id = ${decoded.userId}`;
    if (users.length === 0) {
      return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
    }
    
    const user = users[0];
    
    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          avatarUrl: user.avatar_url,
          preferences: user.preferences,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } }, 401);
  }
});

// POST /auth/logout
authRouter.post("/logout", async (c) => {
  // In a stateless JWT setup, logout is handled client-side
  return c.json({ success: true, data: { message: "Logged out successfully" } });
});

export default authRouter;
