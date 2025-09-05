import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { solutions } from "./solutions";
import { users } from "./users";

export const solutionInteractions = sqliteTable("solution_interactions", {
  id: text("id").primaryKey(),
  solutionId: text("solution_id")
    .notNull()
    .references(() => solutions.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type", { enum: ["like", "dislike", "share"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["active", "removed"] })
    .notNull()
    .default("active"),
});
