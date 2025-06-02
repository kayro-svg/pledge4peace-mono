import { Hono } from "hono";
import { cors } from "hono/cors";
import { solutionsRoutes } from "./routes/solutions";
import { commentsRoutes } from "./routes/comments";
import { authRoutes } from "./routes/auth";
import { pledgesRoutes } from "./routes/pledges";
import { statsRoutes } from "./routes/stats";

const app = new Hono();

// Configure CORS middleware
app.use(
  "*",
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add other allowed origins in production
    ],
    credentials: true, // Allow credentials (cookies, authorization headers)
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400, // 24 hours
  })
);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/solutions", solutionsRoutes);
app.route("/api/comments", commentsRoutes);
app.route("/api/pledges", pledgesRoutes);
app.route("/api/stats", statsRoutes);

export default app;
