import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const solutions = sqliteTable("solutions", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  partyId: text("party_id").notNull(), // Cambió de enum fijo a string genérico
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  metadata: text("metadata"),
});
