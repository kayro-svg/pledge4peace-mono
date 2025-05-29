import { Hono } from "hono";
import { cors } from "hono/cors";
import { solutionsRoutes } from "./routes/solutions";
import { commentsRoutes } from "./routes/comments";
import { authRoutes } from "./routes/auth";

const app = new Hono();

// Middleware d
app.use("*", cors());

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/solutions", solutionsRoutes);
app.route("/api/comments", commentsRoutes);

export default app;
