import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { solutions } from "./solutions";
import { users } from "./users";

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  solutionId: text("solution_id")
    .notNull()
    .references(() => solutions.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["active", "deleted", "hidden"] })
    .notNull()
    .default("active"),
  parentId: text("parent_id").references(() => comments.id),
});
