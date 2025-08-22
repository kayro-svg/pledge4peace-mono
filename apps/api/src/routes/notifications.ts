import { Hono } from "hono";
import { createDb } from "../db";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { NotificationsService } from "../services/notifications.service";
import { and, eq, gt, asc, inArray, isNull } from "drizzle-orm";
import { notifications } from "../db/schema/notifications";
import { users } from "../db/schema/users";
import { z } from "zod";
import { verify } from "hono/jwt";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  KV: KVNamespace;
  NOTIFICATIONS_BOT_TOKEN?: string;
};

export const notificationsRoutes = new Hono<{ Bindings: Bindings }>();

// Broadcast or direct create (protected by BOT token)
notificationsRoutes.post("/", async (c) => {
  // Security: require Authorization Bearer to match env token
  const auth = c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : null;
  if (!token || token !== c.env.NOTIFICATIONS_BOT_TOKEN) {
    return c.body("Unauthorized", 401);
  }

  const db = createDb(c.env.DB);
  const svc = new NotificationsService(db, c.env.KV);
  const body = await c.req.json();

  const type = String(body.type || "");
  const title = String(body.title || "");
  const bodyText = typeof body.body === "string" ? body.body : undefined;
  const href = typeof body.href === "string" ? body.href : undefined;
  const meta = body.meta ?? undefined;

  // broadcastRole: 'moderator' (includes admin/superAdmin)
  const broadcastRole = body.broadcastRole as string | undefined;
  if (broadcastRole === "moderator") {
    const mods = await db
      .select({ id: users.id })
      .from(users)
      // moderators + admins + superAdmins
      .where(inArray(users.role as any, ["moderator", "admin", "superAdmin"]));
    await Promise.all(
      mods.map((m) =>
        svc.create({
          userId: m.id,
          type,
          title,
          body: bodyText,
          href,
          meta,
        })
      )
    );
    return c.json({ success: true, delivered: mods.length });
  }

  // direct to userId
  if (body.userId) {
    await svc.create({
      userId: String(body.userId),
      type,
      title,
      body: bodyText,
      href,
      meta,
    });
    return c.json({ success: true });
  }

  return c.json({ message: "No broadcastRole or userId provided" }, 400);
});

// List notifications (paginated / after)
notificationsRoutes.get("/", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const svc = new NotificationsService(db, c.env.KV);
  const limit = Math.min(
    Math.max(parseInt(c.req.query("limit") || "20"), 1),
    100
  );
  const after = c.req.query("after") ? Number(c.req.query("after")) : undefined;
  const before = c.req.query("before")
    ? Number(c.req.query("before"))
    : undefined;
  const items = await svc.list({ userId: user.id, limit, after, before });
  return c.json({ items });
});

// Mark one as read
notificationsRoutes.post("/:id/read", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const svc = new NotificationsService(db, c.env.KV);
  await svc.markRead(user.id, id);
  return c.body(null, 204);
});

// Mark all as read
notificationsRoutes.post("/read-all", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const svc = new NotificationsService(db, c.env.KV);
  await svc.markAllRead(user.id);
  return c.body(null, 204);
});

// Update last seen timestamp (cheap badge)
notificationsRoutes.post("/seen", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const svc = new NotificationsService(db, c.env.KV);
  // Mark all current notifications as read
  await svc.markAllRead(user.id);
  await db
    .update(users)
    .set({ lastSeenNotificationsAt: new Date() })
    .where(eq(users.id, user.id));
  return c.body(null, 204);
});

// Get unread count
notificationsRoutes.get("/unread-count", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), isNull(notifications.readAt))
    );
  return c.json({ count: rows.length });
});

// SSE stream with KV-hint
notificationsRoutes.get("/stream", async (c) => {
  // SSE cannot send Authorization header in browsers; accept JWT via query param as fallback
  // Prefer Authorization header if present (e.g., proxies)
  let userId: string | null = null;
  const auth = c.req.header("Authorization");
  const tokenParam = c.req.query("token");
  try {
    const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : tokenParam;
    if (!token) return c.body("Unauthorized", 401);
    const payload: any = await verify(token, c.env.JWT_SECRET);
    userId = payload?.id || null;
  } catch {
    return c.body("Unauthorized", 401);
  }
  if (!userId) return c.body("Unauthorized", 401);
  const db = createDb(c.env.DB);
  const kv = c.env.KV; // optional in local; fallback to no KV-hint

  const lastEventIdHeader = c.req.header("Last-Event-ID");
  let lastSent = lastEventIdHeader ? Number(lastEventIdHeader) : 0;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let cancelled = false;
      let lastHeartbeat = Date.now();
      let intervalMs = 3000; // adaptive polling interval
      let subReqs = 0; // approximate subrequest counter to avoid per-invocation limits

      (c.req.raw as any).signal?.addEventListener("abort", () => {
        cancelled = true;
        try {
          controller.close();
        } catch {}
      });

      const send = (ev: any) => {
        const id = Number(ev.createdAt) || Date.now();
        controller.enqueue(encoder.encode(`id: ${id}\n`));
        controller.enqueue(encoder.encode(`event: message\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        lastSent = id;
      };
      const sendEvent = (type: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const heartbeat = () =>
        controller.enqueue(encoder.encode(`:keepalive\n\n`));
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // initial hydrate (last 10)
      // announce hydrate phase so client won't count as unread
      sendEvent("hydrate", { start: true });
      const initial = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId!),
        orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
        limit: 10,
      });
      for (const it of initial.reverse()) send(it);
      sendEvent("hydrated", { done: true });

      while (!cancelled) {
        const latest = kv ? await kv.get(`notif:latest:${userId}`) : null;
        if (kv) subReqs++;
        if (latest && Number(latest) > lastSent) {
          const fresh = await db.query.notifications.findMany({
            where: and(
              eq(notifications.userId, userId!),
              gt(notifications.createdAt, new Date(lastSent))
            ),
            orderBy: (t: any, { asc }: any) => [asc(t.createdAt)],
            limit: 50,
          });
          subReqs++;
          for (const it of fresh) send(it);
          // activity detected → reset interval tighter
          intervalMs = 3000;
        } else {
          if (Date.now() - lastHeartbeat > 25000) {
            heartbeat();
            lastHeartbeat = Date.now();
          }
          // no activity → back off up to 60s
          intervalMs = Math.min(Math.floor(intervalMs * 1.6), 60000);
        }
        // Guard: avoid hitting per-invocation subrequest quotas (KV/D1)
        if (subReqs > 900) {
          try {
            controller.close();
          } catch {}
          break;
        }
        const jitter = Math.floor(
          Math.random() * Math.min(1000, Math.max(200, intervalMs * 0.2))
        );
        await sleep(intervalMs + jitter);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
});

// Preferences: get
notificationsRoutes.get("/preferences", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const row = await db
    .select({ inapp: users.notifyInapp, email: users.notifyEmail })
    .from(users)
    .where(eq(users.id, user.id))
    .then((r) => r[0]);
  return c.json({
    inappEnabled: row ? Number(row.inapp) !== 0 : true,
    emailEnabled: row ? Number(row.email) !== 0 : true,
  });
});

// Preferences: update
notificationsRoutes.post("/preferences", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const db = createDb(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    inappEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
  });
  const parse = schema.safeParse(body);
  if (!parse.success) return c.json({ error: "Invalid body" }, 400);
  const payload: any = {};
  if (parse.data.inappEnabled !== undefined)
    payload.notifyInapp = parse.data.inappEnabled ? 1 : 0;
  if (parse.data.emailEnabled !== undefined)
    payload.notifyEmail = parse.data.emailEnabled ? 1 : 0;
  if (Object.keys(payload).length === 0) return c.json({});
  await db.update(users).set(payload).where(eq(users.id, user.id));
  return c.json({ success: true });
});
