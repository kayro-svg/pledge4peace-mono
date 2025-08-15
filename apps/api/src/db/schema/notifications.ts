import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Notifications table to persist in-app notifications per user
// Uses ULID for id to keep chronological ordering while remaining unique
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  meta: text("meta"),
  actorId: text("actor_id"),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  priority: text("priority"),
  channel: text("channel").default("inapp"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
});
