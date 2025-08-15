import { ulid } from "ulid";
import { and, eq, gt, lt, isNull } from "drizzle-orm";
import { notifications } from "../db/schema/notifications";

type Database = ReturnType<typeof import("../db").createDb>;

export class NotificationsService {
  private db: Database;
  private kv: KVNamespace;

  constructor(db: Database, kv: KVNamespace) {
    this.db = db;
    this.kv = kv;
  }

  private ensureInternalHref(href?: string) {
    if (!href) return undefined;
    if (!href.startsWith("/")) return undefined;
    return href;
  }

  async create(input: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    href?: string;
    meta?: any;
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    priority?: "low" | "normal" | "high";
  }) {
    const id = ulid();
    const createdAt = new Date();

    // Attempt to enrich href if missing but meta includes campaignSlug
    let href = this.ensureInternalHref(input.href);
    try {
      const meta = input.meta || {};
      const slug = meta.slug || meta.campaignSlug;
      const solutionId = meta.solutionId;
      if (!href && slug) {
        const params = new URLSearchParams();
        if (solutionId) params.set("solutionId", String(solutionId));
        if (input.type === "comment" || input.type === "comment_reply") {
          if (meta.commentId) params.set("commentId", String(meta.commentId));
        }
        href = `/campaigns/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
      }
    } catch {}

    await this.db.insert(notifications).values({
      id,
      userId: input.userId,
      type: String(input.type).slice(0, 100),
      title: String(input.title).slice(0, 200),
      body: input.body ? String(input.body).slice(0, 500) : null,
      href,
      meta: input.meta ? JSON.stringify(input.meta) : null,
      actorId: input.actorId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      priority: input.priority || "normal",
      channel: "inapp",
      createdAt,
      readAt: null,
    });

    if (this.kv && typeof this.kv.put === "function") {
      await this.kv.put(
        `notif:latest:${input.userId}`,
        String(createdAt.getTime()),
        { expirationTtl: 60 * 60 * 24 * 7 }
      );
    }

    return { id, createdAt };
  }

  async list(params: {
    userId: string;
    after?: number;
    before?: number;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    if (params.after) {
      return this.db.query.notifications.findMany({
        where: and(
          eq(notifications.userId, params.userId),
          gt(notifications.createdAt, new Date(params.after))
        ),
        orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
        limit,
      });
    }
    if (params.before) {
      return this.db.query.notifications.findMany({
        where: and(
          eq(notifications.userId, params.userId),
          lt(notifications.createdAt, new Date(params.before))
        ),
        orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
        limit,
      });
    }
    return this.db.query.notifications.findMany({
      where: eq(notifications.userId, params.userId),
      orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
      limit,
    });
  }

  async markRead(userId: string, id: string) {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllRead(userId: string) {
    await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt))
      );
  }
}
