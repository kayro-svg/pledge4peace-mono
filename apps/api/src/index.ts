import { Hono } from "hono";
import { cors } from "hono/cors";
import { solutionsRoutes } from "./routes/solutions";
import { commentsRoutes } from "./routes/comments";
import { authRoutes } from "./routes/auth";
import { pledgesRoutes } from "./routes/pledges";
import { statsRoutes } from "./routes/stats";
import { eventsRoutes } from "./routes/events";
import { usersRoutes } from "./routes/users";
import { volunteerRoutes } from "./routes/volunteer";
import { contactRoutes } from "./routes/contact";
import { AuthService } from "./services/auth.service";
import { BrevoListsService } from "./services/brevo-lists.service";
import { createDb } from "./db";

interface Env {
  JWT_SECRET: string;
  BREVO_API_KEY: string;
  FROM_EMAIL: string;
  FROM_NAME?: string;
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// Configure CORS middleware
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://pledge4peace.vercel.app",
      "https://www.pledge4peace.org",
      // Add other allowed origins in production
    ],
    credentials: true, // Allow credentials (cookies, authorization headers)
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    maxAge: 86400, // 24 hours
  })
);

// Configure auth service middleware
app.use("*", async (c, next) => {
  // Crear instancia de BD
  const db = createDb(c.env.DB);

  // Recoger valores de entorno
  const jwtSecret = c.env.JWT_SECRET;
  const brevoApiKey = c.env.BREVO_API_KEY;
  const fromEmail = c.env.FROM_EMAIL;
  const fromName = c.env.FROM_NAME || "Pledge4Peace";

  const brevoConfig = {
    apiKey: brevoApiKey,
    fromEmail,
    fromName,
  };

  // Instanciar AuthService
  const authService = new AuthService(db, jwtSecret, brevoConfig);
  c.set("authService", authService);

  // Instanciar BrevoListsService
  const brevoListsService = new BrevoListsService({
    apiKey: brevoApiKey,
    subscribersListId: 25, // P4P - Subscribers #25
    conferenceAttendeesListId: 23, // P4P - Conference Attendees #23
    volunteersListId: 21, // P4P - Volunteers #21
  });
  c.set("brevoListsService", brevoListsService);

  await next();
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/solutions", solutionsRoutes);
app.route("/api/comments", commentsRoutes);
app.route("/api/pledges", pledgesRoutes);
app.route("/api/stats", statsRoutes);
app.route("/api/events", eventsRoutes);
app.route("/api/users", usersRoutes);
app.route("/api/volunteer", volunteerRoutes);
app.route("/api/contact", contactRoutes);

export default app;
