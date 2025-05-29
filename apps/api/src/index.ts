import { Hono } from "hono";
import { cors } from "hono/cors";
import { solutionsRoutes } from "./routes/solutions";
import { commentsRoutes } from "./routes/comments";
import { authRoutes } from "./routes/auth";
import { pledgesRoutes } from "./routes/pledges";

const app = new Hono();

// Middleware d
app.use("*", cors());

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/solutions", solutionsRoutes);
app.route("/api/comments", commentsRoutes);
app.route("/api/pledges", pledgesRoutes);

export default app;
