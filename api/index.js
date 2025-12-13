import { Hono } from "hono";
import { cors } from "hono/cors";
import postgres from "postgres";
import booksRouter from "./routes/books";
import bookRelatedRouter from "./routes/book-related";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import workspacesRouter from "./routes/workspaces";
import contentRouter from "./routes/content";
import notesRouter from "./routes/notes";
import dashboardRouter from "./routes/dashboard";
import insightsRouter from "./routes/insights";
import { mockBooks } from "./lib/mockData";

const app = new Hono();

// CORS middleware
app.use("*", cors({
	origin: ["http://localhost:5173", "https://influix.pages.dev"],
	credentials: true,
}));

// Setup SQL client middleware
app.use("*", async (c, next) => {
	// Check if Hyperdrive binding is available
	if (c.env.HYPERDRIVE) {
		try {
			// Create SQL client
			const sql = postgres(c.env.HYPERDRIVE.connectionString, {
				max: 5,
				fetch_types: false,
			});

			c.env.SQL = sql;
			c.env.DB_AVAILABLE = true;

			// Process the request
			await next();

			// Close the SQL connection after the response is sent
			c.executionCtx.waitUntil(sql.end());
		} catch (error) {
			console.error("Database connection error:", error);
			c.env.DB_AVAILABLE = false;
			c.env.MOCK_DATA = mockBooks;
			await next();
		}
	} else {
		// No Hyperdrive binding available, use mock data
		console.log("No database connection available. Using mock data.");
		c.env.DB_AVAILABLE = false;
		c.env.MOCK_DATA = mockBooks;
		await next();
	}
});

app.route("/api/books", booksRouter);
app.route("/api/books/:id/related", bookRelatedRouter);

// InfluiX API v1 routes
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/users", usersRouter);
app.route("/api/v1/workspaces", workspacesRouter);
app.route("/api/v1/content", contentRouter);
app.route("/api/v1/notes", notesRouter);
app.route("/api/v1/dashboard", dashboardRouter);
app.route("/api/v1/insights", insightsRouter);

// Health check
app.get("/health", (c) => {
	return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API root
app.get("/api/v1", (c) => {
	return c.json({
		name: "InfluiX API",
		version: "0.1.0",
		endpoints: [
			"/api/v1/auth",
			"/api/v1/users",
			"/api/v1/workspaces",
			"/api/v1/content",
			"/api/v1/notes",
			"/api/v1/dashboard",
			"/api/v1/insights",
		],
	});
});

// Catch-all route for static assets
app.all("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
});

export default {
	fetch: app.fetch,
};
